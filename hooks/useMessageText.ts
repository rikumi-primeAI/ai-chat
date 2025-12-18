"use client"

interface MessagePart {
  type: string
  text?: string
}

interface UIMessage {
  id: string
  role: string
  parts?: MessagePart[]
}

/**
 * UIMessage の parts 配列からテキストコンテンツを抽出する
 */
export function useMessageText() {
  return (message: UIMessage): string => {
    if (message.parts && Array.isArray(message.parts)) {
      const textParts = message.parts.filter((part) => part.type === 'text')
      return textParts.map((part) => part.text || '').join('')
    }
    return ''
  }
}
