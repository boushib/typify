import { ALPHABET } from "../constants"

export const formatToNDigits = (n: number, digits: number) => {
  return n.toString().padStart(digits, "0")
}

export const getRandomChar = () => ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
