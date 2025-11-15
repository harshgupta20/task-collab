import versionInfo from '../scripts/writeVersion';

const Version = () => (
  <div className="text-gray-500 text-sm">
    Version: {versionInfo.version} | Commit: {versionInfo.commitHash}
  </div>
);

export default Version;
