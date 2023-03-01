# Components

Component are used for showing/editing fields.
Every component have list, show, input view.
Filter and edit component is not required, it will use create component if they are undefined

## Creating new components

Just call `registerComponent`, and pass required params.
And then simply import file so it's included in project

```js
// components.tsx
export const mc: RegisterComponentParams = ({...})

// index.tsx
import './components.tsx'

```

## Built in components

All components in this folder are built in, and utilize standard props
