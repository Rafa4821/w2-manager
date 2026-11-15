import W2CopyHtml from '../engine/W2CopyHtml'
import '../engine/w2copy.css'

export default function Template({ data = {} }) {
  return (
    <div className="w2page w2page--2x2">
      <div className="w2grid-2x2">
        <div className="w2grid-cell">
          <div className="w2copy-header">Copy B—To Be Filed With Employee's FEDERAL Tax Return.</div>
          <W2CopyHtml data={data} copyLabel="Copy B" copyDesc="" layout="compact" />
        </div>
        <div className="w2grid-cell">
          <div className="w2copy-header">Copy 2—To Be Filed With Employee's State, City, or Local Income Tax Return</div>
          <W2CopyHtml data={data} copyLabel="Copy 2" copyDesc="" layout="compact" />
        </div>
        <div className="w2grid-cell">
          <div className="w2copy-header">Copy C—For EMPLOYEE'S RECORDS (See Notice to Employee on the back of Copy B.)</div>
          <W2CopyHtml data={data} copyLabel="Copy C" copyDesc="" layout="compact" />
        </div>
        <div className="w2grid-cell">
          <div className="w2copy-header">Copy 2—To Be Filed With Employee's State, City, or Local Income Tax Return</div>
          <W2CopyHtml data={data} copyLabel="Copy 2" copyDesc="" layout="compact" />
        </div>
      </div>
    </div>
  )
}
