
type Badge = {
    bestwpm: number | null
    monkeyTypeLogo: string
}

const ERROR_TEMPLATE = `<svg width="200" height="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <text>fail</text>
</svg>`

export default function generateBadge({ bestwpm, monkeyTypeLogo }: Badge) {
    if (bestwpm === null) return ERROR_TEMPLATE
    if (monkeyTypeLogo === null) return ERROR_TEMPLATE

    return `<svg width="200" height="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <foreignObject width="100%" height="100%">
      <style>
        div {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
        }
        .container {
          display: flex;
          align-items: center;
          border-radius: 10px;
          width: 100%;
          height: 100%;
          background: #eee;
          font-size: 14px;
          border-radius: 2px;
        }
        .monkeytypelogo {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          background: #333333;
          color: white;
          gap: 4px;
          height: 100%;
          border-radius: 2px 0 0 2px;
        }
        .wpm {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          background: #DAB322;
          color: #333333;
          border-radius: 0 2px 2px 0;
        }
      </style>
      <div xmlns="http://www.w3.org/1999/xhtml" class="container">
        <div class="monkeytypelogo">
          <img src="${monkeyTypeLogo}" height="18" width="18" />
          <div>Monkeytype</div>
        </div>
        <div class="wpm">${bestwpm} wpm</div>
      </div>
      </foreignObject>
    </svg>`
}