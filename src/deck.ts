import { Card } from './card.js'

type Suits = "diams" | "clubs" | "hearts" | "spades"
type Ranks =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "j"
  | "q"
  | "k"
  | "a"

export default class Deck {
  ranks: Ranks[]
  suits: Suits[]
  deck: Card[]
  constructor() {
    this.ranks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "j",
      "q",
      "k",
      "a",
    ]
    this.suits = ["diams", "clubs", "hearts", "spades"]
    this.deck = this.getAllCards()
    this.shuffleDeck(this.deck)
  }

  getAllCards() {
    let cards: Card[] = []
    // combine ranks x suits
    for (let i = 0; i < this.ranks.length; i += 1) {
      for (let k = 0; k < this.suits.length; k += 1) {
        cards = [...cards, { rank: this.ranks[i], suit: this.suits[k] }]
      }
    }
    return cards
  }

  drawRandomCardIndex(): number {
    return Math.floor(Math.random() * this.deck.length) // grab index from 0 to 51
  }

  shuffleDeck(deck: Card[]) {
    const swapTwoCards = (i: number): void => {
      let randomIndex = this.drawRandomCardIndex()
      let card = deck[i]
      deck[i] = deck[randomIndex]
      deck[randomIndex] = card
    }

    for (let i = 0; i < deck.length; i++) {
      swapTwoCards(i)
    }
    return deck
  }
}
