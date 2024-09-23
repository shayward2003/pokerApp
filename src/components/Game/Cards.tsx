import { useState } from "react";
import {PlayerCard} from '../../scripts/types'

type CardProps = {
    card:PlayerCard,
    dealt:boolean,
    onCardChange: (cardID: number, cardState:PlayerCard) => void
}

const Cards = (props:CardProps) => {

    const [cardDetail, setCardDetail] = useState(props.card);

    // handle and send click back to parent Poker Component
    const handleClick = () => {
        if(!props.dealt) {
            return;
        }
        // set opposite of current selected state
        const newCardState = { ...cardDetail, selected: !cardDetail.selected };
        setCardDetail(newCardState);
        // handle card select
        props.onCardChange(cardDetail.id, newCardState)
      };

    return (
        <div
            className = {"cardHolder " + (cardDetail.selected ? 'selected' : '') +" "+ cardDetail.suit  }
            onClick = {handleClick}
        >
            <span>{cardDetail.unicode}</span>
        </div>
     );
}
 
export default Cards;