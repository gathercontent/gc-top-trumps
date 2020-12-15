import React, { useState } from "react"
import { map } from "lodash"
import { Card } from "../Card"

export function UserTurn({ usersTurnCard: { name, cardDescription, ...attributes } }) {
   const [selectedAttribute, setSelectedAttribute] = useState(null)

   const parsedAttributes = map(attributes, (value, key) => ({ description: key, score: value }))

   return (
      <div>
         <Card
            name={name}
            description={cardDescription}
            attributes={parsedAttributes}
            selectedAttribute={selectedAttribute}
            onSelectAttribute={setSelectedAttribute}
         />
         <button>Slam It!</button>
      </div>
   )
}
