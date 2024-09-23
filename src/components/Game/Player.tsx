
import Hand from "./Hand";
import {PlayerCard, PlayerInterface} from '../../scripts/types'

type PlayerProps = {
    player: PlayerInterface,
    winner: string,
    dealt:boolean,
    onCardChange: (cardID: number, cardState:PlayerCard) => void,
    debug:boolean
}

const Player = (props: PlayerProps) => {
    return ( 
        <div className={"playerHolder "+ props.winner} key = {props.player.id}>
            <p>Player # {props.player.id} | {props.player.name}</p>
            <Hand
                player = {props.player}
                onCardChange={props.onCardChange}
                dealt={props.dealt}
            />
            <p>Wins: {props.player.wins}</p>

            {props.debug && (<p>Hand Score <b>{props.player.pokerHand.handScore}</b> </p>)}
        </div>
    );
}
 
export default Player;