export interface PlayerCard {
    card:      string,
    id:        number,
    rank:      string,
    rankValue: number,
    suit:      string,
    unicode:   string,
    selected?: boolean
  }

 export interface PlayerInterface {
    id:        number,
    name:      string,
    cards:     PlayerCard[],
    wins:      number,
    pokerHand: PokerHand
  }

export type PokerHand = {
  text : string,
  handScore:number,
  remainingCards?:number[]
}