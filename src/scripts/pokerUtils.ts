
import {PlayerCard, PokerHand} from './types'

//used to determine which cards from the deck are dealt to each player
export const createPlayerHandArray= (length:number, playerIndex:number, numberOfPlayers:number) => {
    return Array.from({ length }, (_, index) => index * numberOfPlayers + playerIndex);
};

//shuffle deck
export const shuffle = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const findNextHighest = (array: number[], currentMax: number): number | null => {
    const uniqueSorted = Array.from(new Set(array)).sort((a, b) => b - a); // Get unique values sorted in descending order
    const nextIndex = uniqueSorted.indexOf(currentMax) + 1; // Find the next index
    return nextIndex < uniqueSorted.length ? uniqueSorted[nextIndex] : null; // Return next highest or null if not found
};

const compareKickers= (array1: number[], array2: number[]): number[] | null => {

    // Find the maximum value in each array
    let max1 = Math.max(...array1);
    let max2 = Math.max(...array2);

    // Check for ties and find the next highest value if necessary
    let i = 0;
    while (max1 === max2 && i < 7) {
        i++;
        max1 = findNextHighest(array1, max1) || -Infinity; // Move to the next highest or set to -Infinity if not found
        max2 = findNextHighest(array2, max2) || -Infinity;
    }

    // we have a tie
    if (i === 7) {
        return null;
    }
    // Return the array with the highest number
    return max1 > max2 ? array1 : array2;
};

export const FindWinner = (players:PokerHand[]):number[] => {

    let winnerIndex:number[] = players.reduce<number[]>((
            winners:number[],
            player:PokerHand,
            currentPlayerIndex:number,
            players:PokerHand[]
        ) => {
            console.log(player);
            // if no set winners OR handScore is larger, set the new winner hand
            if(winners.length === 0 || player.handScore > players[winners[0]].handScore) {
                return [currentPlayerIndex];
            }
            if (player.handScore === players[winners[0]].handScore) {
                // tie

                // if no remaining cards, no kickers, then we are tied
                if (!player.remainingCards && !players[winners[0]].remainingCards) {
                    winners.push(currentPlayerIndex)
                    return winners;
                }

                // we have kickers to evaluate, compare kickers and return the array with the largest kicker
                const result = compareKickers(player.remainingCards ?? [], players[winners[0]].remainingCards ?? []);
                console.log(result);
                    // if we have a result, someone kickers were larger
                    if(result) {
                        // if array matches player, set currentPlayerIndex as the winner
                        if(result === player.remainingCards) {
                            return [currentPlayerIndex];
                        } else {
                            // leave the winners array as it is
                            return winners;
                        }
                    } else {
                        // we have a kicker tie, push to winners array
                        winners.push(currentPlayerIndex)
                        return winners;
                    }
            }
        // if we make it here, nothing is greater then current winner, leave winners the same
        return winners;
    },[]);

    // indexs are based on the array index and are 1 lesser than actual
    return winnerIndex.map(value => value+1);
}


// get an array of all the counts of the ranks, used to determine poker hand
const getRankCounts = (cards: PlayerCard[]): { [rank: number]: number } => {

    if (Object.values(cards).length >0) {
        return cards.reduce((acc, card) => {
            acc[card.rankValue] = (acc[card.rankValue] || 0) + 1;
            return acc;
    }, {} as { [rank: number]: number });

    }
    return {0:0};
};

// count suits, to help detmine a flush
const getSuitCounts = (cards: PlayerCard[]): { [suit: string]: number } => {
    return cards.reduce((acc, card) => {
        acc[card.suit] = (acc[card.suit] || 0) + 1;
        return acc;
    }, {} as { [suit: string]: number });
};

// if we have 5 of the same suits we have a flush
const isFlush = (suits: { [suit: string]: number }): boolean => {
    return Object.values(suits).some(count => count === 5);
};

// logic to determin if we have a straight
const isStraight = (ranks:any[], uniqueRanks:number): boolean => {
    // if we dont have 5 unique cards, we dont have a straight
    if (uniqueRanks !== 5){
        return false;
    }
    // is there an ace in the hand
    let hasAnAce = ranks.includes(14);
    // sort ranks from lowest to highest
    const sortedRanks = ranks.sort((a, b) => a - b);

    // should be 4 if we have a straight
    let lastFirst = sortedRanks[4] - sortedRanks[0];

    // check for straight if ace is low
    if (lastFirst !== 4 && hasAnAce) {
        let aceLowSortedRanks = ranks.sort((a,b) => {
            a = (a === 14) ? 1 : a;
            b = (b === 14) ? 1 : b;
            return a-b;
        })
        // should be -9 to be a straight
        lastFirst = aceLowSortedRanks[4] - aceLowSortedRanks[0];

    }
    // if lastFirst comparisaon is 4 or -9 we have a straight
    return ( (lastFirst === 4) || (lastFirst === -9) );
};


// logic to determine the poker have, and poker hand score, used to help determine the winner
export const determinePokerHand = (cards: PlayerCard[]): PokerHand => {

    // no cards no hand
    if (cards.length === 0) {
        return { text: 'No Hand', handScore: 0 };
    }

    let handScore = 0;

    // just the rankValues of the hand
    const ranks = cards.map((card) => card.rankValue);

    // data from the various methods that will help determine the hand
    const suits = getSuitCounts(cards);
    const rankCounts = getRankCounts(cards);
    const uniqueRanks = Object.keys(rankCounts).length;
    const hasFlush = isFlush(suits);
    const hasStraight = isStraight(ranks, uniqueRanks);

    // if flush and straight, we have royal flush or straight flush
    if (hasFlush && hasStraight) {
        // check for specific royal flush cards A-10
        if (ranks.includes(14) && ranks.includes(13) && ranks.includes(12) && ranks.includes(11) && ranks.includes(10)) {
            // we have royal flush
            handScore = 1000;
            return {text:'Royal Flush', handScore:handScore};
        }
        // we have straight flush
        handScore = 900;
        // get the high card for comparing with other straight flushes
        let highCard = cards.reduce((acc, card) => (card.rankValue > acc) ? card.rankValue : acc , 0)
        handScore += highCard;

        return {text:'Straight Flush', handScore:handScore};
    }

    // check for 4 of a kind
    if (Object.values(rankCounts).includes(4)) {
        // we have 4 of a kind
        handScore = 800;
        // get value of 4 of kind, to add to handscore
        let fourOfKindValue = parseInt(Object.entries(rankCounts).find(([key, value]) => value === 4)?.[0] || '');
        handScore += fourOfKindValue;

        // get kicker to pass in case we need it to break a tie
        let remainingCards = Object.keys(rankCounts).map(card => parseInt(card)).filter(card => card !== fourOfKindValue);

        return {text:'Four of a Kind', handScore:handScore, remainingCards:remainingCards};
    }

    // check for full house
    if (Object.values(rankCounts).includes(3) && Object.values(rankCounts).includes(2)) {
        // we have full house
        handScore = 700
        let threeOfKindValue = parseInt(Object.entries(rankCounts).find(([key, value]) => value === 3)?.[0] || '');
        handScore += threeOfKindValue;
        console.log(ranks);
        return {text:'Full House', handScore:handScore, remainingCards:ranks};
    }

    // check for flush
    if (hasFlush) {
        // we have a flush
        handScore = 600;
        // get top card to compare the flush
        let highCard = cards.reduce((acc, card) => (card.rankValue > acc) ? card.rankValue : acc , 0)
        handScore += highCard;

        // pass all cards incase the high card of flush is tied
        return {text:'Flush', handScore:handScore, remainingCards:ranks};
    }

    //check for straight
    if (hasStraight) {
        // we have a straight
        handScore = 500;

        // get high and low card to check for Ace low straight
        let highCard = cards.reduce((acc, card) => (card.rankValue > acc) ? card.rankValue : acc , 0);
        let lowCard = cards.reduce((acc, card) => (card.rankValue < acc) ? card.rankValue : acc , 15);

        // we have a ace low straight, set high card to 5
        if (highCard === 14 && lowCard === 2) {
            highCard = 5;
        }

        handScore += highCard;
        return {text:'Straight', handScore:handScore};
    }

    // check for three of a kind
    if (Object.values(rankCounts).includes(3)) {
        // we have three of a kind
        let threeOfKindValue = parseInt(Object.entries(rankCounts).find(([key, value]) => value === 3)?.[0] || '');
        handScore = 400;
        handScore += threeOfKindValue;
        // kickers
        let remainingCards = Object.keys(rankCounts).map(card => parseInt(card)).filter(card => card !== threeOfKindValue);
        console.log(remainingCards, '3ofkind');

        return {text:'Three of a Kind', handScore:handScore, remainingCards:remainingCards};
    }

    // check for two pair
    if (Object.values(rankCounts).filter(count => count === 2).length === 2) {
        // we have two pair
        handScore = 300;
        // sort by pairs, high pair to low pair and kicker
        let pairRanks = Object.entries(rankCounts).sort(([keyA, valA], [keyB, valB]) => {
            if (valA !== valB) {
                return valB - valA;
            }
            return parseInt(keyB)-parseInt(keyA);
        });

        let highPair = parseInt(pairRanks[0][0]);
        handScore += highPair;

        // set up remainingcards to have 2nd pair and then kicker
        let remainingCards = pairRanks.reduce<number[]>((acc, val) => {
            let v = parseInt(val[0]);
            if(v !== highPair) {
                acc.push(v);
            }
            return acc;
        }, [])

        return {text:'Two Pair', handScore:handScore, remainingCards:remainingCards};
    }

    // check for pair
    if (Object.values(rankCounts).includes(2)) {
        // we have a pair
        let handScore = 200;
        let pairValue = parseInt(Object.entries(rankCounts).find(([key, value]) => value === 2)?.[0] || '');
        handScore += pairValue;

        let remainingCards = Object.keys(rankCounts).map(card => parseInt(card)).filter(card => card !== pairValue);
        return {text:'One Pair',  handScore:handScore, remainingCards:remainingCards};
    }

    // no anything, so set to high card
    handScore = 100;
    let highCard = cards.reduce((acc, card) => (card.rankValue > acc) ? card.rankValue : acc , 0)
    handScore += highCard;

    let remainingCards = Object.keys(rankCounts).map(card => parseInt(card)).filter(card => card !== highCard);

    return {text:'High Card',  handScore:handScore, remainingCards:remainingCards};
};