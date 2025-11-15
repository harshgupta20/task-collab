import PackageJson from "../../package.json";

const Version = () => (
  <div className="text-gray-300 text-sm">
    Version: {PackageJson.version}
  </div>
);

export default Version;
