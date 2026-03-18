import { useState, useEffect, useCallback } from "react"
import LogEntry from "../models/LogEntry"
import MessageUtil from "../lib/MessageUtil"
import TagUtil from "../lib/TagUtil"
import Tag from "../models/Tag"

export interface ScoresEachTag {
  category: string
  score: number
}

export interface ScoreEachWord {
  word: string
  count: number
  score: number
}

export interface WordEachCategory {
  category: string
  words: ScoreEachWord[]
}

export function useLogViewer() {
  const [subject, setSubject] = useState("")
  const [from, setFrom] = useState("")
  const [classificate, setClassificate] = useState("")
  const [scores, setScores] = useState<ScoresEachTag[]>([])
  const [wordscore, setWordscore] = useState<WordEachCategory[]>([])
  const [targetText, setTargetText] = useState("")
  const [notFound, setNotFound] = useState(true)

  const getTagName = useCallback(
    (tags: Tag[], key: string): string | undefined => {
      return tags.find((t) => t.key === key)?.name
    },
    []
  )

  const showWordScore = useCallback(
    (logEntry: LogEntry, tags: Tag[]): WordEachCategory[] => {
      const result: WordEachCategory[] = []
      const scoreEachWord = logEntry.scoreEachWord

      for (const word in scoreEachWord) {
        const scores = scoreEachWord[word].score
        const count = scoreEachWord[word].count
        let bestCategory = ""
        let bestScore = { word: "", count: 0, score: 0 }

        for (const category in scores) {
          const score = scores[category]
          if (bestScore.score <= score) {
            bestCategory = category
            bestScore = { word, count, score }
          }
        }

        let catName = getTagName(tags, bestCategory)
        if (catName === undefined) catName = "削除されたタグ"

        if (bestScore.score !== 0) {
          const existing = result.find((item) => item.category === catName)
          if (existing === undefined) {
            result.push({ category: catName, words: [bestScore] })
          } else {
            existing.words.push(bestScore)
          }
        }
      }

      for (const category of result) {
        category.words.sort((a, b) => b.score - a.score)
        category.words = category.words.slice(0, 9)
      }

      return result
    },
    [getTagName]
  )

  const initialize = useCallback(async () => {
    const header = (
      (await browser.storage.local.get("logTarget")) as
        | undefined
        | { logTarget: browser.messages.MessageHeader }
    )?.logTarget

    if (!header) {
      setNotFound(true)
      return
    }

    setSubject(header.subject)
    setFrom(header.author)
    setNotFound(false)

    const logEntry = new LogEntry()
    logEntry.id = await MessageUtil.getMailMessageId(header)

    if (!(await logEntry.load())) {
      setNotFound(true)
      return
    }

    const tags = await TagUtil.load()

    const classTag = getTagName(tags, logEntry.classifiedTag)
    if (classTag !== undefined) setClassificate(classTag)

    const newScores: ScoresEachTag[] = []
    for (const score of logEntry.score) {
      const tag = getTagName(tags, score.category)
      if (tag !== undefined)
        newScores.push({ category: tag, score: score.score })
    }
    setScores(newScores)
    setWordscore(showWordScore(logEntry, tags))
    setTargetText(logEntry.targetText.join(" "))
  }, [getTagName, showWordScore])

  useEffect(() => {
    initialize()

    const onActivated = async (info: browser.tabs.activeInfo) => {
      const thisTab = await browser.tabs.getCurrent()
      if (info.tabId === thisTab.id) {
        initialize()
      }
    }

    browser.tabs.onActivated.addListener(onActivated)
    return () => {
      browser.tabs.onActivated.removeListener(onActivated)
    }
  }, [initialize])

  return {
    subject,
    from,
    classificate,
    scores,
    wordscore,
    targetText,
    notFound,
  }
}
