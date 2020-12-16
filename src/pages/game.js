import React, {useEffect, useState} from 'react';
import {graphql} from "gatsby";
import {chunk, map, orderBy, shuffle} from "lodash";
import {UserTurn} from "../../UI/UserTurn";
import {Result} from "../../UI/Result";

export const PLAYER_USER = "PLAYER_USER"
export const PLAYER_COMPUTER = "PLAYER_COMPUTER"

export default function Game({data, location}) {

   // const [cards] = useState(
   //    data.cards.edges.map(card => ({
   //       ...card.node,
   //       rarity: parseInt(card.node.rarity[0]?.label),
   //       spreadability: parseInt(card.node.spreadability[0]?.label),
   //       versatility: parseInt(card.node.versatility[0]?.label),
   //       trendiness: parseInt(card.node.trendiness[0]?.label),
   //       tastiness: parseInt(card.node.tastiness[0]?.label),
   //    }))
   // )

   const cards = [
      {
         name: "Ume Plum Jam\n",
         cardDescription:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris in faucibus dolor, ac viverra libero. Fusce bibendum diam felis, ut condimentum nulla rutrum vitae. \n\n\n",
         rarity: 5,
         spreadability: 7,
         tastiness: 1,
         versatility: 6,
         trendiness: 4,
      },
      {
         name: "Crap Card",
         cardDescription: "\n",
         rarity: 1,
         spreadability: 1,
         tastiness: 1,
         versatility: 1,
         trendiness: 1,
      },
      {
         name: "God CARD",
         cardDescription: "\n",
         rarity: 10,
         spreadability: 10,
         tastiness: 10,
         versatility: 10,
         trendiness: 10,
      },
      {
         name: "Mediocre Card",
         cardDescription: "\n",
         rarity: 1,
         spreadability: 2,
         tastiness: 3,
         versatility: 4,
         trendiness: 5,
      },
      {
         name: "Another Card",
         cardDescription: "\n",
         rarity: 2,
         spreadability: 5,
         tastiness: 3,
         versatility: 5,
         trendiness: 6,
      },
      {
         name: "Extra Card",
         cardDescription: "\n",
         rarity: 1,
         spreadability: 6,
         tastiness: 5,
         versatility: 3,
         trendiness: 1,
      },
   ]

   const [gameWinner, setGameWinner] = useState(null)
   const [roundWinner, setRoundWinner] = useState(null)
   const [turnCount, setTurnCount] = useState(0)

   const [isUsersTurn, setIsUsersTurn] = useState(true)
   const [selectedAttribute, setSelectedAttribute] = useState(0)

   const [computersCards, setComputersCards] = useState([])
   const [usersCards, setUsersCards] = useState([])

   const [usersTurnCard, setUsersTurnCard] = useState([])
   const [computersTurnCard, setComputersTurnCard] = useState([])

   const incrementTurnCount = () => setTurnCount(turnCount + 1)

   const startGame = () => {
      const shuffledCards = shuffle(cards)
      const splitCards = chunk(shuffledCards, shuffledCards.length / 2)

      setUsersCards(splitCards[0])
      setComputersCards(splitCards[1])

      incrementTurnCount()
   }

   const drawCard = () => {
      setComputersTurnCard(computersCards[0])
      setUsersTurnCard(usersCards[0])

      setUsersCards(usersCards.slice(1))
      setComputersCards(computersCards.slice(1))
   }

   const computersTurn = () => {
      const {name, cardDescription, ...attributes} = computersTurnCard

      const attributesArray = map(attributes, (value, key) => ({key: key, value: value}))
      const orderedAttributes = orderBy(attributesArray, ["value"], ["desc"])
      setTimeout(() => slamJams(orderedAttributes[0].key), 1500);
   }

   const slamJams = attribute => {

      setSelectedAttribute(attribute)

      const hasUserWon = usersTurnCard[attribute] > computersTurnCard[attribute]
      const isDraw = usersTurnCard[attribute] === computersTurnCard[attribute]

      if (isDraw) {
         console.log(
            `Draw: Users= ${attribute} - ${usersTurnCard[attribute]} \n Computers= ${attribute} - ${computersTurnCard[attribute]}`
         )
         setUsersCards([...usersCards, usersTurnCard])
         setComputersCards([...computersCards, computersTurnCard])
         setIsUsersTurn(!isUsersTurn)
         setRoundWinner(false);
         return
      }

      if (hasUserWon) {
         console.log(
            `User Won: Users= ${attribute} - ${usersTurnCard[attribute]} \n Computers= ${attribute} - ${computersTurnCard[attribute]}`
         )
         setUsersCards([...usersCards, usersTurnCard, computersTurnCard])
         setIsUsersTurn(true)
         setRoundWinner(PLAYER_USER);
         return
      }
      console.log(
         `Computer Won: Users= ${attribute} - ${usersTurnCard[attribute]} \n Computers= ${attribute} - ${computersTurnCard[attribute]}`
      )
      setComputersCards([...computersCards, computersTurnCard, usersTurnCard])
      setIsUsersTurn(false)
      setRoundWinner(PLAYER_COMPUTER);

      return
   }

   useEffect(() => {
      if (!turnCount) {
         return
      }

      if (!usersCards.length || !computersCards.length) {
         setGameWinner(usersCards.length ? PLAYER_USER : PLAYER_COMPUTER)
         return
      }

      setRoundWinner(null);
      drawCard()
      if (!isUsersTurn) {
         computersTurn()
      }
   }, [turnCount])

   useEffect(() => {
      startGame()
   }, [])

   return (
      <div>
         <div>{location?.state?.name ?? 'no name'}</div>

         {isUsersTurn && !roundWinner && (
            <UserTurn usersTurnCard={usersTurnCard} slamJams={slamJams}></UserTurn>
         )}
         {!isUsersTurn && !roundWinner && (
            'COMPUTERS TURN'
         )}
         {roundWinner && (
            <Result usersTurnCard={usersTurnCard} computersTurnCard={computersTurnCard}
                    winner={roundWinner} selectedAttribute={selectedAttribute}
                    incrementTurnCount={incrementTurnCount}
                    slamJams={slamJams}></Result>
         )}
      </div>
   )
}

export const pageQuery = graphql`
query pageQuery
{
   cards: allGatherContentCard
   {
      edges
      {
         node
         {
            name
            cardDescription
            rarity
            {
               label
            }
            spreadability
            {
               label
            }
            tastiness
            {
               label
            }
            versatility
            {
               label
            }
            trendiness
            {
               label
            }
         }
      }
   }
}
`