import { Card } from './card.js'
import Deck from './deck.js'

const playerPointsEl = document.querySelector<HTMLParagraphElement>(
  ".player-points"
)
const dealerPointsEl = document.querySelector<HTMLParagraphElement>(
  ".dealer-points"
)
const playerHandEl = document.querySelector<HTMLUListElement>(".player-hand")
const dealerHandEl = document.querySelector<HTMLUListElement>(".dealer-hand")
const dealerScoreEl = document.querySelector<HTMLSpanElement>(".dealer-score")
const playerScoreEl = document.querySelector<HTMLSpanElement>(".player-score")
const hitButton = document.querySelector<HTMLButtonElement>(".hit")
const standButton = document.querySelector<HTMLButtonElement>(".stand")
const restartButton = document.querySelector<HTMLButtonElement>(".restart")
const gameResultEl = document.querySelector<HTMLParagraphElement>(
  ".game-result"
)

enum GameStatus {
  running = "",
  win = "win",
  bust = "bust",
  push = "push",
}

export default class Game {
  deck: Card[]
  dealerScore: number
  playerScore: number
  playerPoints: number
  dealerPoints: number
  playerHand: Card[]
  dealerHand: Card[]
  gameResult: GameStatus
  constructor(prevPlayerScore = 0, prevDealerScore = 0) {
    let deck = new Deck()
    this.deck = deck.deck
    this.playerScore = prevPlayerScore
    this.dealerScore = prevDealerScore
    this.playerPoints = 0
    this.dealerPoints = 0
    this.gameResult = GameStatus.running
    this.playerHand = []
    this.dealerHand = []
    this.initButtons()
  }

  /* Model methods */

  drawCard() {
    return this.deck.pop()
  }
  drawInitHand() {
    let cards = [this.drawCard(), this.drawCard()]
    return cards
  }

  // Blackjack card evaluation
  translateCardValue(card: Card) {
    switch (card.rank) {
      case "a":
        return 11
      case "k":
      case "q":
      case "j":
        return 10
      default:
        return +card.rank
    }
  }

  getHandValue(hand: Card[], limit: number = -1) {
    // @param limit = -1 does not limit counting card values of a hand
    let total = 0
    let aceCount = 0

    for (let i = 0; i < hand.length; i += 1) {
      if (i === limit) break
      else if (hand[i].rank === "a") { // has aces in hand?
        aceCount += 1
      }
      total += this.translateCardValue(hand[i])
    }

    if (aceCount > 0 && total > 21) {
      // reduce ace value from 11 to 1 if total is over 21 to prevent bust
      return total - (10 * aceCount) 
    }
    return total
  }

  newRound() {
    this.playerPoints = 0
    this.dealerPoints = 0
    this.playerHand = []
    this.dealerHand = []

    this.gameResult = GameStatus.running
    gameResultEl.innerHTML = this.gameResult

    dealerHandEl.innerHTML = ""
    playerHandEl.innerHTML = ""

    dealerPointsEl.innerHTML = ""
    playerPointsEl.innerHTML = ""
    this.toggleButtons(false)
    this.renderScore()

    this.playerHand = this.drawInitHand()
    this.dealerHand = this.drawInitHand()
    dealerHandEl.appendChild(this.renderCard(this.dealerHand[0]))
    dealerHandEl.appendChild(this.renderCard(this.dealerHand[1], true))
    playerHandEl.appendChild(this.renderCard(this.playerHand[0]))
    playerHandEl.appendChild(this.renderCard(this.playerHand[1]))
    this.updatePoints(true)

    if (this.playerPoints === 21) {
      this.gameResult = GameStatus.win // player won
      this.renderGameResult()
    }
  }

  updatePoints(countFirstCardOnly = false) {
    this.playerPoints = this.getHandValue(this.playerHand, -1)
    if (countFirstCardOnly === true) {
      this.dealerPoints = this.getHandValue(this.dealerHand, 1)
    } else {
      this.dealerPoints = this.getHandValue(this.dealerHand, -1)
    }
    playerPointsEl.innerHTML = this.playerPoints.toString()
    dealerPointsEl.innerHTML = this.dealerPoints.toString()
  }

  /* Controller Methods */

  initButtons() {
    hitButton.addEventListener("click", () => {
      this.hit()
    })
    standButton.addEventListener("click", () => {
      this.stand()
    })

    restartButton.addEventListener("click", () => {
      let deck = new Deck()
      this.deck = deck.deck
      this.newRound()
    })
  }

  hit() {
    if (this.playerPoints < 21) {
      let newCard: Card = this.drawCard()!
      this.playerHand = [...this.playerHand, newCard]
      playerHandEl.appendChild(this.renderCard(newCard))
      this.updatePoints(true)
    }

    if (this.playerPoints > 21) {
      this.gameResult = GameStatus.bust
      gameResultEl.innerHTML = this.gameResult
      this.renderGameResult()
    } else if (this.dealerPoints === this.playerPoints) {
      this.gameResult = GameStatus.push
      gameResultEl.innerHTML = this.gameResult
      this.renderGameResult()
    }  else if (this.playerPoints === 21) { // assistance: disable button as hitting once more and player will go bust
      hitButton.disabled = true
    } 
  }

  stand() {
    this.updatePoints() // first recalculate dealer hand value (incl. initial second card)

    while (this.dealerPoints <= 16) {
      let newCard: Card = this.drawCard()!
      this.dealerHand = [...this.dealerHand, newCard]
      dealerHandEl.appendChild(this.renderCard(newCard))
      this.updatePoints()
    }

    if (this.dealerPoints > 21) {
      this.gameResult = GameStatus.win
    }

    if (this.dealerPoints <= 21 && this.playerPoints < this.dealerPoints) {
      this.gameResult = GameStatus.bust
    } else if (this.dealerPoints === this.playerPoints) {
      this.gameResult = GameStatus.push
    } else {
      this.gameResult = GameStatus.win
    }
    this.renderGameResult()
  }

  /* View Methods */

  renderCard(card: Card, back = false) {
    let rank = card.rank
    let suit = card.suit

    const cardWrapper = document.createElement("li")
    const cardInnerRank = document.createElement("span")
    const cardInnerSuit = document.createElement("span")
    if (back !== true) {
      cardWrapper.classList.add("card", `rank-${rank}`, suit)
    } else {
      cardWrapper.classList.add("card", "back", `rank-${rank}`, suit)
    }
    cardInnerRank.classList.add("rank")
    cardInnerRank.innerHTML = rank.toUpperCase()
    cardInnerSuit.classList.add("suit")
    cardInnerSuit.innerHTML = `&${suit};`
    cardWrapper.appendChild(cardInnerRank)
    cardWrapper.appendChild(cardInnerSuit)
    return cardWrapper
  }

  renderGameResult(): void {
    this.revealDealerHand()

    gameResultEl.innerHTML = this.gameResult
    if (this.gameResult === GameStatus.win) {
      this.playerScore += 1
    } else if (this.gameResult === GameStatus.bust) {
      this.dealerScore += 1
    }
    this.renderScore()
    this.toggleButtons(true)
  }

  renderScore() {
    playerScoreEl.innerHTML = this.playerScore.toString()
    dealerScoreEl.innerHTML = this.dealerScore.toString()
  }

  revealDealerHand() { // reveal back-facing card
    this.updatePoints()
    dealerPointsEl.innerHTML = this.dealerPoints.toString()
    let cardEl = document.querySelector(".back")!
    cardEl.classList.remove("back")
  }

  revealDealerPoints() { // reveal full dealer points
    dealerPointsEl.innerHTML = this.dealerPoints.toString()
  }
  toggleButtons(disabled: boolean) {
    hitButton.disabled = disabled
    standButton.disabled = disabled
  }
}
