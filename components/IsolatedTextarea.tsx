import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

interface IsolatedTextareaProps {
  placeholder?: string
  className?: string
  onValueChange?: (value: string) => void
  minLength?: number
}

export interface IsolatedTextareaRef {
  getValue: () => string
  setValue: (value: string) => void
  focus: () => void
  clear: () => void
}

const IsolatedTextarea = forwardRef<IsolatedTextareaRef, IsolatedTextareaProps>(
  ({ placeholder, className, onValueChange, minLength = 0 }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const valueRef = useRef<string>('')
    const lastNotifiedValue = useRef<string>('')

    useImperativeHandle(ref, () => ({
      getValue: () => valueRef.current,
      setValue: (value: string) => {
        valueRef.current = value
        if (textareaRef.current) {
          textareaRef.current.value = value
        }
      },
      focus: () => {
        textareaRef.current?.focus()
      },
      clear: () => {
        valueRef.current = ''
        if (textareaRef.current) {
          textareaRef.current.value = ''
        }
        if (onValueChange) {
          onValueChange('')
        }
        lastNotifiedValue.current = ''
      }
    }))

    useEffect(() => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current

      // Event handler nativo
      const handleInput = (e: Event) => {
        const target = e.target as HTMLTextAreaElement
        const newValue = target.value
        valueRef.current = newValue

        // Notificar mudança apenas se valor realmente mudou
        if (newValue !== lastNotifiedValue.current) {
          lastNotifiedValue.current = newValue
          if (onValueChange) {
            // Usar setTimeout para evitar conflitos de re-render
            setTimeout(() => onValueChange(newValue), 0)
          }
        }
      }

      // Event handlers para manter o valor
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent any external interference
        e.stopPropagation()
      }

      const handleFocus = () => {
        // Garantir que o valor está correto quando foca
        if (textarea.value !== valueRef.current) {
          textarea.value = valueRef.current
        }
      }

      // Adicionar listeners nativos
      textarea.addEventListener('input', handleInput, { passive: true })
      textarea.addEventListener('keydown', handleKeyDown)
      textarea.addEventListener('focus', handleFocus)

      // Definir valor inicial
      textarea.value = valueRef.current

      return () => {
        textarea.removeEventListener('input', handleInput)
        textarea.removeEventListener('keydown', handleKeyDown)
        textarea.removeEventListener('focus', handleFocus)
      }
    }, [onValueChange])

    return (
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        className={className}
        style={{
          resize: 'none',
          outline: 'none'
        }}
        // Não usar onChange, value, ou qualquer prop controlada do React
      />
    )
  }
)

IsolatedTextarea.displayName = 'IsolatedTextarea'

export default IsolatedTextarea