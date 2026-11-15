import W2CopyHtml from '../engine/W2CopyHtml'
import '../engine/w2copy.css'

export default function Template({ data = {} }) {
  return (
    <div>
      <div className="w2page w2page-landscape" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <W2CopyHtml data={data} copyLabel="Copy 1" copyDesc="State Copy" />
      </div>
      <div className="w2page w2page-landscape" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <W2CopyHtml data={data} copyLabel="Copy 2" copyDesc="State Copy" />
      </div>
      <div className="w2page w2page-landscape" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <W2CopyHtml data={data} copyLabel="Copy 3" copyDesc="State Copy" />
      </div>
    </div>
  )
}
