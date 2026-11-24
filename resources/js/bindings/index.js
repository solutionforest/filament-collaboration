import { AdapterBinding } from './adapter.js'
import { ItemsBinding } from './items.js'

/**
 * Lists (repeaters, builders, uploads) are Filament's own structure, bound
 * here. Every other field goes through an adapter, Filament's own fields
 * exactly like a third-party editor.
 *
 * @param {FieldKind} kind
 */
export const bindingFor = (kind) => (kind === 'items' ? ItemsBinding : AdapterBinding)
