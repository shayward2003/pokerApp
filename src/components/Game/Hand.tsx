
import Cards from "./Cards";
import {PlayerCard, PlayerInterface} from '../../scripts/types'

type HandProps = {
    player: PlayerInterface,
    dealt:boolean,
    onCardChange: (cardID: number, cardState:PlayerCard) => void
}

const Hand = (props:HandProps) => {

    return ( 
        <div className="hand">
            {props.player.cards.length > 0 && <p>{props.player.pokerHand.text}</p> }
            {props.player.cards.length === 0 && <p className="waiting">Waiting To Deal</p> }

            {props.player.cards && props.player.cards.map((card)=>(
                <Cards
                    card = {card}
                    key = {card.id}
                    onCardChange={props.onCardChange}
                    dealt = {props.dealt}
                />
            ))}
        </div>
     );
}
 
export default Hand;