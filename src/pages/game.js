import React, {useContext, useEffect, useState, useRef} from "react"
import {graphql, navigate} from "gatsby"
import {useSpring} from "react-spring"
import {chunk, orderBy, shuffle} from "lodash"
import {UserTurn} from "../../UI/UserTurn"
import {ComputersTurn} from "../../UI/ComputersTurn";
import {ScoreAside} from "../../UI/ScoreAside"
import resultStyles from "../../UI/Result/result.module.css";
import InfoIcon from "../components/InfoIcon";
import {GetAttributesFromCard} from "../utils/helpers"
import {ResultFooter} from '../components/ResultFooter';
import {AudioContext} from '../context/AudioContext';

export const PLAYER_USER = "PLAYER_USER"
export const PLAYER_COMPUTER = "PLAYER_COMPUTER"
export const DRAW_PLAYER = "DRAW_PLAYER"
export const DRAW_COMPUTER = "DRAW_COMPUTER"

export const GAME_STATE_YOUR_TURN = "YOUR_TURN"
export const GAME_STATE_WAITING_FOR_COMPUTER = "WAITING_FOR_COMPUTER "
export const GAME_STATE_COMPUTER_TURN = "COMPUTER_TURN"
export const GAME_STATE_RESULTS = "STATE_RESULTS"
const GAME_NUMBER_OF_CARDS = 10;

export default function Game({data}) {
   const [userProps, userSet] = useSpring(() => ({opacity: 1}))
   const [waitingProps, waitingSet] = useSpring(() => ({opacity: 0, display: "none"}))
   const {playRoundWin, playRoundLoose} = useContext(AudioContext);

   const names = [
      'Barack O - Jar - Ma',
      'Jamantha Fox',
      'Halle Berry',
      'Silence of the Jams',
      'David Jameron',
      'Spready Murphy',
      'Lidney Poitier',
      'Jam Humphries',
   ]

   const cards = data.cards.edges.map(card => ({
         ...card.node,
         mugshot: card.node.mugshot[0]?.optimised_image_url,
         rarity: parseInt(card.node.rarity[0]?.label),
         spreadability: parseInt(card.node.spreadability[0]?.label),
         versatility: parseInt(card.node.versatility[0]?.label),
         trendiness: parseInt(card.node.trendiness[0]?.label),
         tastiness: parseInt(card.node.tastiness[0]?.label),
      })
   )

   const shuffledCards = shuffle(cards)
   const splitCards = chunk(shuffledCards, GAME_NUMBER_OF_CARDS/2);

   const [allState, setAllState] = useState({
      gameState: GAME_STATE_YOUR_TURN,
      computerName: shuffle(names)[0],
      usersCards: splitCards[0],
      computersCards: splitCards[1],
      turnCount: 1,
      roundsWon: 0,
      roundWinner: null,
      gameWinner: null,
      currentPlayer: PLAYER_USER,
      selectedAttribute: 0
   })

   const allStateRef = useRef(allState)
   allStateRef.current = allState

   const [timeElapsed, setTimeElapsed] = useState(0)

   useEffect(() => {
      const intervalId = setInterval(() => {
         setTimeElapsed(timeElapsed + 1)
      }, 1000)

      return () => clearInterval(intervalId)
   }, [timeElapsed])

   const incrementTurnCount = () => setAllState((previousState) => ({
      ...previousState,
      turnCount: previousState.turnCount + 1
   }))

   const usersTurn = (cards = {}) => {
      waitingSet({opacity: 0, display: "none"})
      userSet({opacity: 1, display: "block"})
      setAllState((previousState) => ({
         ...previousState, ...cards,
         gameState: GAME_STATE_YOUR_TURN,
         selectedAttribute: 0
      }))
   }

   const computersTurn = (cards = {}) => {
      userSet({opacity: 0, display: "none"})
      waitingSet({opacity: 1, display: "block"})

      const attributes = GetAttributesFromCard(cards.computersCards[0])
      const orderedAttributes = orderBy(attributes, ["score"], ["desc"])

      setAllState((previousState) => ({
         ...previousState,
         ...cards,
         gameState: GAME_STATE_COMPUTER_TURN,
         selectedAttribute: 0
      }))

      setTimeout(() => slamJams(orderedAttributes[0].description), 1500)
   }

   const takeTurn = attribute => {
      waitingSet({opacity: 1, display: "block"})
      userSet({opacity: 0, display: "none"})
      setAllState((previousState) => ({
         ...previousState,
         gameState: GAME_STATE_WAITING_FOR_COMPUTER
      }))
      setTimeout(() => slamJams(attribute), 700);
   }

   const drawCard = () => {
      const [usersCard, ...usersRemaining] = allState.usersCards;
      const [computersCard, ...computersRemaining] = allState.computersCards;

      if (allState.roundWinner === PLAYER_USER) {
         return {
            computersCards: computersRemaining,
            usersCards: [...usersRemaining, usersCard, computersCard],
         }
      }

      if (allState.roundWinner === PLAYER_COMPUTER) {
         return {
            usersCards: usersRemaining,
            computersCards: [...computersRemaining, computersCard, usersCard],
         }
      }

      return {
         usersCards: [...usersRemaining, usersCard],
         computersCards: [...computersRemaining, computersCard]
      }
   }

   const slamJams = attribute => {
      waitingSet({opacity: 1, display: "block"})
      userSet({opacity: 1, display: "block"})

      const [usersCard] = allStateRef.current.usersCards;
      const [computersCard] = allStateRef.current.computersCards;

      const hasUserWon = usersCard[attribute] > computersCard[attribute]
      const isDraw = usersCard[attribute] === computersCard[attribute]

      if (isDraw) {
         playRoundLoose();

         setAllState((previousState) => ({
            ...previousState,
            roundWinner: previousState.currentPlayer === PLAYER_USER ? DRAW_PLAYER : DRAW_COMPUTER,
            gameState: GAME_STATE_RESULTS,
            selectedAttribute: attribute
         }))
         return
      }

      if (hasUserWon) {
         playRoundWin();

         setAllState((previousState) => ({
            ...previousState,
            roundsWon: previousState.roundsWon + 1,
            currentPlayer: PLAYER_USER,
            roundWinner: PLAYER_USER,
            gameState: GAME_STATE_RESULTS,
            selectedAttribute: attribute
         }))

         return
      }

      playRoundLoose();

      setAllState((previousState) => ({
         ...previousState,
         currentPlayer: PLAYER_COMPUTER,
         roundWinner: PLAYER_COMPUTER,
         gameState: GAME_STATE_RESULTS,
         selectedAttribute: attribute
      }))

      return
   }

   useEffect(() => {
      const gameStateIsResults = allState.gameState === GAME_STATE_RESULTS
      const userLost = allState.usersCards.length === 1 && allState.roundWinner === PLAYER_COMPUTER
      const computerLost = allState.computersCards.length === 1 && allState.roundWinner === PLAYER_USER

      if (gameStateIsResults && (userLost || computerLost)) {
         setAllState((previousState) => ({
            ...previousState,
            gameWinner: userLost ? PLAYER_COMPUTER : PLAYER_USER
         }))
      }

   }, [allState.gameState])

   useEffect(() => {
      if (!allState.gameWinner) {
         return
      }

      setTimeout(() => navigate("/results", {
         state: {
            won: allState.gameWinner === PLAYER_USER,
            turnCount: allState.turnCount,
            roundsWon: allState.roundsWon,
            timeElapsed: timeElapsed,
         },
      }), 3000)

   }, [allState.gameWinner])

   useEffect(() => {
      if (allState.turnCount === 1) {
         return
      }

      const cards = drawCard();

      usersTurn(cards)

   }, [allState.turnCount])

   return (
      <InfoIcon>
         <ScoreAside
            cardsLeft={allState.usersCards.length}
            turnNumber={allState.turnCount}
            wins={allState.roundsWon}
            timeElapsed={timeElapsed}
         />
         <div className={resultStyles.resultContainer}>
            <div className={resultStyles.result}>
               <UserTurn
                  isResults={allState.gameState === GAME_STATE_RESULTS}
                  animationStyle={userProps}
                  card={allState.usersCards[0]}
                  takeTurn={takeTurn}
                  playerWon={
                     allState.gameState === GAME_STATE_RESULTS &&
                     allState.roundWinner === PLAYER_USER
                  }
                  showButton={allState.gameState !== GAME_STATE_RESULTS}
                  selectedAttribute={allState.selectedAttribute}
                  setSelectedAttribute={attr =>
                     setAllState((previousState) => ({...previousState, selectedAttribute: attr}))
                  }
                  slamJams={slamJams}
               />

            </div>
            <div className={resultStyles.result}>
               <ComputersTurn
                  animationStyle={waitingProps}
                  name={allState.computerName}
                  isLoading={allState.gameState !== GAME_STATE_RESULTS}
                  loadingLabel={
                     allState.gameState === GAME_STATE_WAITING_FOR_COMPUTER
                        ? "Waiting"
                        : "Choosing Jam Stat"
                  }
                  playerWon={allState.roundWinner === PLAYER_COMPUTER}
                  computersTurnCard={allState.computersCards[0]}
                  selectedAttribute={allState.selectedAttribute}
               />
            </div>
            {allState.gameState === GAME_STATE_RESULTS && (
               <ResultFooter nextRound={incrementTurnCount} roundWinner={allState.roundWinner}
                             showNextRoundButton={!allState.gameWinner}/>
            )}
         </div>
      </InfoIcon>
   )
}

export const pageQuery = graphql`
query cardsQuery {
  cards: allGatherContentItemsByFolderPlayingcards {
    edges {
      node {
        id
        cardDescription
        rarity {
          label
        }
        mugshot {
          optimised_image_url
        }
        mugshotAltText
        spreadability {
          label
        }
        tastiness {
          label
        }
        trendiness {
          label
        }
        versatility {
          label
        }
        name
        mugshotAltText
        mugshot {
          optimised_image_url
        }
      }
    }
  }
}
`
