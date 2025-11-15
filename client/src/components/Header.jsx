import { Avatar } from "@mui/material"
import Version from "./Version";

const Header = () => {
  return (
    <div className="w-full h-full flex justify-end items-center p-2 border-b border-gray-200">

      <div className="flex items-center gap-3">
        <Avatar>H</Avatar>
      </div>
    </div>
  )
}

export default Header;