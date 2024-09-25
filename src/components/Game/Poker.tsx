
import { useEffect, useState } from "react";
import Player from "./Player";
import {PlayerCard, PlayerInterface, PokerHand} from '../../scripts/types'
import { shuffle, createPlayerHandArray, FindWinner, determinePokerHand} from '../../scripts/pokerUtils';

type PokerProps = {
    settings: any
}

const Poker = (props: PokerProps) => {

    let startGame = true;
    // deck init settings
    let [cardData] = useState<PlayerCard[]>(props.settings.cards);
    let [cards, setCards] = useState<number[]>(Array.from(Array(52).keys()));
    let [deckIndex, setDeckIndex] = useState(0);
    let [dealBtn, setDealBtn] = useState('Deal');
    let [dealt, setDealt] = useState(false);
    let [stats, setStats] = useState<PokerHand[]>([]);

    // setting players from settings
    let [gamePlayers, setGamePlayers] = useState<PlayerInterface[]>(props.settings.players);

    // other game variables needed
    let [winner, setWinner] = useState<number[]>([]);

    // save cards that have been selected
    const handleCardSelect = (cardID:number, cardState:PlayerCard) => {
        setGamePlayers(gamePlayers.map( (player) => {
            player.cards = player.cards.map((card) => {
                return (card.id === cardID) ? card ={ ...card, ...cardState } : card;
            });
            return player;
        }));
    }

    // used to loop and show the full deck of cards, in debug mode
    const showDeck = () => {
        return cards.map((card) => {
            return cardData[card];
        });
    }

    const delay = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));


    // added method that allows for delay on updating player hands on draw
    const playerHandChangeWithDelay = async () => {
        let i = 0;

        for (const player of gamePlayers) {
            // Wait 1 second before updating the next player
            await delay(props.settings.msBetweenHandCardDraw);

            let playerID = player.id;
            console.log(playerID);

            setGamePlayers((prevPlayers) =>
                prevPlayers.map((player) => {
                    if (playerID === player.id) {
                        player.cards = player.cards.map((card) => {
                            if (card.selected) {
                                let newCard = cardData[cards[deckIndex + i]];
                                newCard.selected = false;
                                i++;
                                return newCard;
                            }
                            return card;
                        });
                        return player;
                    }
                    return player;
                })
            );
        }
    };



    useEffect(() => {
        dealDraw();


    }, [startGame]);
    // deal/draw cards
    const dealDraw = () => {
        // first deal, not the draw
        if (!dealt) {
            // reset winner
            setWinner([]);

            //shuffle deck
            setCards(shuffle(cards));
            let totalCards = props.settings.numOfCards;

            // deal cards to each players
            gamePlayers.map((player,index) => {
                // remove cards from player hand
                player.cards = [];

                let numbers = createPlayerHandArray(totalCards, index, gamePlayers.length);

                // let the setting of hands for debug purposes
                if (props.settings.setHands) {
                    // use player index to match set hands from settings
                    props.settings.debugHands[index].map((cardByName:string) => {
                        let card = cardData.filter((card) => {
                            return card.card === cardByName;
                        });

                        player.cards.push(cardData[card[0].id]);
                        return card;
                    });
                } else {
                    // not setting hands via settings so draw cards from deck
                    numbers.map((number) => {
                        player.cards.push(cardData[cards[number]]);
                        return number;
                    });
                }

                // set index of deck card after dealt cards
                setDeckIndex(gamePlayers.length*totalCards);
                setDealt(true);
                setDealBtn('Draw Cards');

                return player;

            });

        } else {
            // we have already dealt so now we are drawing selected cards for players
            setDealBtn('Deal New Hand');


            let i = 0;

            playerHandChangeWithDelay();




            // });
            // // loop through players hands, if card is selected, deal top card on deck
            // setGamePlayers( gamePlayers.map( (player) => {
            //     player.cards = player.cards.map((card) => {
            //         if (card.selected){
            //             card = cardData[cards[deckIndex+i]]
            //             i++;
            //         }
            //         return card;
            //     });
            //     return player;
            // }));
            // set new deck index after all the dealing
            setDeckIndex(deckIndex+i);
            setDealt(false);
        }

        // after deal and draw, reestablish players poker hands (ie two pair, flush,etc)
        setGamePlayers( gamePlayers.map( (player) => {
            player.pokerHand = determinePokerHand(player.cards);
            return player;
        }));

        // only determine winner after the draw
        if (dealt) {

            // add hands to stats state, to show numbers
            setStats([...stats, ...gamePlayers.map( (player) => {return player.pokerHand;})])

            // if players dont have cards, dont determine winner
            if(gamePlayers[0].cards.length > 0) {
                let winnerIndex = FindWinner(
                    gamePlayers.reduce((playerPokerHands:PokerHand[], player:PlayerInterface) => {
                        if(player.pokerHand) {
                            playerPokerHands.push(player.pokerHand);
                        }
                        return playerPokerHands;
                    }, []));

                // set the winner(s) for UI changes
                setWinner(winnerIndex);
                // add a win to each winner(s) count
                setGamePlayers( gamePlayers.map( (player) => {
                    if ( winnerIndex.includes(player.id)) {
                        player.wins++;
                    }
                    return player;
                }));
            } // end of do players have cards
        } //end did we just draw cards
    }; // end of dealDraw btn click


    return (
        <div className="pokerHolder">
            <div className="pokerTable" >
                <div className="players" >
                    {gamePlayers.map((player)=>(
                        <Player
                            winner ={(winner.includes(player.id) ? 'winner' : '')}
                            player = {player}
                            key ={player.id}
                            onCardChange={handleCardSelect}
                            debug = {props.settings.debug}
                            dealt = {dealt}
                        />

                    ))}
                </div>
            </div>
            <button className="dealBtn" onClick={dealDraw} >{dealBtn}</button>

            {props.settings.debug && (
                <div className ="fulldeck">
                    {showDeck().map((card, index) => (
                        <span className = {"fulldeck "+ card.suit+ " "+ (index<deckIndex ? 'used' : '')} key={index}>
                            {card.unicode}
                        </span>
                    ))}
                </div>
            )}

            <div className="pokerStats">
                <table>
                    <tr>
                        <th>Poker Hand</th>
                        <th>Frequency</th>
                    </tr>
                {props.settings.pokerHands.map((pokerHand:string) => (
                    <tr>
                        <td>{pokerHand}</td>
                        <td>{stats.reduce( (acc:number, stat) => {if(stat.text === pokerHand) {acc++;}; return acc; },0)} </td>
                    </tr>
                ))}
                </table>
            </div>

        </div>
    );
}
 
export default Poker;
