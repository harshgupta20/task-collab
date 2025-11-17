import { Avatar, MenuItem, Select, FormControl } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { customQueryCollection } from "../firebase/firestore";
import { toast } from "sonner";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fullPath = location.pathname;


  const [options, setOptions] = useState([]);
  const [value, setValue] = useState(null);


  const resolveProjectIdFromPath = (path) => {
    // Split path: "/projects/123/abc/xyz" -> ["", "projects", "123", "abc", "xyz"]
    const parts = path.split("/");

    // Validate base structure
    if (parts.length < 3 || parts[1] !== "projects") {
      setValue(null);
      return;
    }

    // Capture ONLY the ID after /projects/
    const id = parts[2];

    // Validate ID (alphanumeric)
    if (!/^[A-Za-z0-9]+$/.test(id)) {
      setValue(null);
      return;
    }

    setValue(id);
  }


  const handleChange = (event) => {
    navigate(`/projects/${event.target.value}`);
  }

  const fetchProjects = async () => {
    try {
      const response = await customQueryCollection("projects", [["created_by", "==", "00"]]);
      setOptions(response?.map(proj => ({ value: proj.id, label: proj.project_name })) || []);
    }
    catch (err) {
      toast.warning("Failed to fetch projects");
    }
  }


  useEffect(() => {
    // if(projectId){
    resolveProjectIdFromPath(fullPath);
    fetchProjects();
    // setValue(projectId);
    // }
  }, [fullPath, value]);


  return (
    <div className="w-full h-full flex justify-between items-center p-2 border-b border-gray-200">

      <div className="flex items-center p-2 gap-6">

        {value && (
          <FormControl size="small" className="w-36">
            <Select
              value={value}
              onChange={handleChange}
              className="bg-white rounded-md"
              sx={{
                fontSize: "14px",
                height: "36px",
                ".MuiSelect-select": { paddingY: "8px" },
              }}
            >
              {options?.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}


        {/* ID Display */}
        {value &&
          <span className="text-gray-700 text-sm">
            Project ID: <span className="font-semibold">{value}</span>
          </span>
        }
      </div>

      <div className="flex items-center gap-3">
        <Avatar sx={{ width: 32, height: 32 }}>H</Avatar>
      </div>
    </div>
  );
};

export default Header;
