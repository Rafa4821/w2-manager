import W2CopyHtml from '../engine/W2CopyHtml'
import '../engine/w2copy.css'

export default function Template({ data = {} }) {
  return (
    <div className="w2page w2page-2col">
      <W2CopyHtml data={data} copyLabel="Copy B" copyDesc="To Be Filed with Employee's FEDERAL Tax Return." />
      <W2CopyHtml data={data} copyLabel="Copy 2" copyDesc="To Be Filed with Employee's State, City, or Local Income Tax Return." />
      <W2CopyHtml data={data} copyLabel="Copy C" copyDesc="For Employee's Records." />
      <W2CopyHtml data={data} copyLabel="Copy D" copyDesc="For Employer." />
    </div>
  )
}
