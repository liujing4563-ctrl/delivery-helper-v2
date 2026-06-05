export default function DisclaimerBox() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <p className="font-semibold">⚠️ 免责声明</p>
      <p className="mt-1">
        本站提供的内容仅为法律信息和一般性指引，<strong>不构成律师法律意见</strong>。
        具体维权请咨询{' '}
        <a href="tel:12348" className="font-semibold underline">
          12348
        </a>{' '}
        或当地法律援助中心。
      </p>
    </div>
  );
}