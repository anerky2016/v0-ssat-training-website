"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListChecks, ArrowLeft, Volume2, Info } from "lucide-react"
import Link from "next/link"
import vocabularyData from "@/data/vocabulary-words.json"

export default function WordListsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [playingWord, setPlayingWord] = useState<string | null>(null)
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)

  const filteredWords = vocabularyData.words.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pronounceWord = (word: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      setPlayingWord(word)
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.8 // Slightly slower for clarity
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        setPlayingWord(null)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      alert('Sorry, your browser does not support text-to-speech.')
    }
  }

  // Highlight the target word in example sentences
  const highlightWord = (text: string, targetWord: string) => {
    const regex = new RegExp(`\\b(${targetWord})\\b`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.toLowerCase() === targetWord.toLowerCase()) {
        return (
          <span key={index} className="font-bold text-chart-5 bg-chart-5/10 px-1 rounded">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <Link
                href="/vocabulary"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Vocabulary
              </Link>

              <div className="mb-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10 text-chart-5">
                  <ListChecks className="h-6 w-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                  Vocabulary Word Lists
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Comprehensive SSAT vocabulary with pronunciations, definitions, examples, and etymology.
                </p>

                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-chart-5"
                  />
                  <div className="text-sm text-muted-foreground">
                    {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {filteredWords.map((word, index) => (
                  <Card key={index} className="border-l-4 border-l-chart-5 bg-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="relative">
                              <CardTitle
                                className="text-2xl font-bold text-foreground cursor-pointer hover:text-chart-5 transition-colors border-b-2 border-dashed border-transparent hover:border-chart-5"
                                onClick={() => setActiveTooltip(activeTooltip === index ? null : index)}
                              >
                                {word.word}
                              </CardTitle>
                              {activeTooltip === index && (
                                <div className="absolute z-10 mt-2 p-3 bg-chart-5 text-white rounded-lg shadow-xl max-w-xs text-sm leading-relaxed">
                                  <div className="font-semibold mb-1">{word.meanings[0]}</div>
                                  <div className="text-xs opacity-90 italic">{word.part_of_speech}</div>
                                  <div className="absolute -top-2 left-4 w-4 h-4 bg-chart-5 transform rotate-45"></div>
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                pronounceWord(word.word)
                              }}
                              className={`h-12 w-12 p-0 rounded-full transition-all shadow-lg ${
                                playingWord === word.word
                                  ? 'bg-chart-5 hover:bg-chart-5/90 animate-pulse'
                                  : 'bg-chart-5 hover:bg-chart-5/90 hover:scale-110'
                              }`}
                              title="Click to hear pronunciation"
                            >
                              <Volume2 className="h-6 w-6 text-white" />
                            </Button>
                            <span className="text-base text-muted-foreground font-normal">
                              {word.pronunciation}
                            </span>
                          </div>
                          <CardDescription className="text-sm italic">
                            {word.part_of_speech}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Meanings */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                          Definition{word.meanings.length > 1 ? 's' : ''}
                        </h3>
                        <ol className="list-decimal list-inside space-y-1">
                          {word.meanings.map((meaning, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground leading-relaxed">
                              {meaning}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Examples */}
                      {word.examples && word.examples.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                            Example{word.examples.length > 1 ? 's' : ''}
                          </h3>
                          <div className="space-y-2">
                            {word.examples.map((example, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground italic pl-4 border-l-2 border-chart-5 leading-relaxed">
                                "{highlightWord(example, word.word)}"
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Synonyms and Antonyms */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {word.synonyms && word.synonyms.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                              Synonyms
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {word.synonyms.map((syn, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs rounded-md bg-green-500/10 text-green-700 dark:text-green-400"
                                >
                                  {syn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {word.antonyms && word.antonyms.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                              Antonyms
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {word.antonyms.map((ant, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-700 dark:text-red-400"
                                >
                                  {ant}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Further Information */}
                      {word.further_information && word.further_information.length > 0 && (
                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-chart-5" />
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                              Additional Notes
                            </h3>
                          </div>
                          <ul className="space-y-2">
                            {word.further_information.map((info, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-chart-5 flex-shrink-0" />
                                <span className="leading-relaxed">{info}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredWords.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No words found matching "{searchTerm}"</p>
                  </CardContent>
                </Card>
              )}

              <div className="mt-8 flex justify-center">
                <Link href="/vocabulary/flashcards">
                  <Button size="lg" className="bg-chart-5 hover:bg-chart-5/90">
                    Practice with Flashcards
                  </Button>
                </Link>
              </div>

              <Card className="mt-8 border-chart-5 bg-chart-5/5">
                <CardHeader>
                  <CardTitle>Study Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>• Pay attention to the etymology (word origins) to understand root meanings</p>
                  <p>• Notice patterns in synonyms to build word families in your memory</p>
                  <p>• Read the examples carefully to understand context and usage</p>
                  <p>• Look for common prefixes and suffixes (ab-, -tion, -ive, etc.)</p>
                  <p>• Practice using new words in your own sentences</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
