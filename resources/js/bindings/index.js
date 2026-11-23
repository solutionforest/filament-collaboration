import { ItemsBinding } from './items.js'
import { RichTextBinding } from './rich-text.js'
import { TextBinding } from './text.js'
import { ValueBinding } from './value.js'

/** One binding per `FieldKind`. */
export const bindings = { text: TextBinding, rich: RichTextBinding, value: ValueBinding, items: ItemsBinding }
