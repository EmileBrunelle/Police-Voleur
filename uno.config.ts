import { defineConfig, presetAttributify, presetWind3 } from 'unocss'

const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
const disabled = 'disabled:opacity-40 disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:cursor-not-allowed'

export default defineConfig({
  presets: [presetWind3(), presetAttributify()],
  shortcuts: {
    btn: `px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-slate-100 text-sm cursor-pointer hover:bg-slate-600 ${focus} ${disabled}`,
    'seg-item': `px-3 py-1.5 rounded-md text-sm cursor-pointer bg-transparent text-slate-200 hover:bg-slate-700 data-[state=checked]:bg-sky-700 data-[state=checked]:text-white ${focus} ${disabled}`,
    'switch-label': `flex items-center gap-2 text-sm text-slate-200 bg-transparent border-0 p-0 cursor-pointer ${focus} rounded ${disabled}`,
    'switch-track': 'relative inline-flex w-10 h-6 rounded-full bg-slate-600 data-[state=checked]:bg-sky-600 transition-colors',
    'switch-thumb': 'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform data-[state=checked]:translate-x-4',
  },
})
