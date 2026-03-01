import * as ublBuilder from 'ubl-builder'

export function ShowcasePage() {
  const exportsList = Object.keys(ublBuilder).sort()

  return (
    <main>
      <h1>Showcase</h1>
      <p>This page lists exports from the `ubl-builder` package.</p>

      {exportsList.length > 0 ? (
        <ul>
          {exportsList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No exports detected.</p>
      )}
    </main>
  )
}
