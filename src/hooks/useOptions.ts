import { useState, useEffect, useCallback } from "react"
import Tag from "../models/Tag"
import TagUtil from "../lib/TagUtil"
import StatisticsUtil from "../lib/StatisticsUtil"

export function useOptions() {
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [bodyMaxLength, setBodyMaxLength] = useState<number>(100)
  const [logDeletePastHour, setLogDeletePastHour] = useState<number>(72)

  const initialize = useCallback(async () => {
    const loadedTags = await TagUtil.load()
    const bodyLen = (
      (await browser.storage.local.get("body_max_length")) as {
        body_max_length?: number
      }
    ).body_max_length
    const logHour = (
      (await browser.storage.local.get("log_delete_past_hour")) as {
        log_delete_past_hour?: number
      }
    ).log_delete_past_hour

    setTags(loadedTags)
    setSelectedTags(loadedTags.filter((t) => t.useClassification))
    setBodyMaxLength(bodyLen ?? 100)
    setLogDeletePastHour(logHour ?? 72)
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  const save = useCallback(
    async (bodyLen: number, logHour: number): Promise<void> => {
      await TagUtil.save(selectedTags)
      await browser.storage.local.set({ body_max_length: bodyLen })
      await browser.storage.local.set({ log_delete_past_hour: logHour })
    },
    [selectedTags]
  )

  const cancel = useCallback(async (): Promise<void> => {
    await initialize()
  }, [initialize])

  const clearLearn = useCallback(async (): Promise<void> => {
    await browser.storage.local.remove("data")
    await browser.storage.local.remove("totalCount")
  }, [])

  const resetStatistic = useCallback(async (): Promise<void> => {
    await StatisticsUtil.resetStatistics()
  }, [])

  const clearSetting = useCallback(async (): Promise<void> => {
    await browser.storage.local.clear()
  }, [])

  return {
    tags,
    selectedTags,
    setSelectedTags,
    bodyMaxLength,
    setBodyMaxLength,
    logDeletePastHour,
    setLogDeletePastHour,
    save,
    cancel,
    clearLearn,
    resetStatistic,
    clearSetting,
  }
}
