// src/components/RichTooltip.jsx
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

const RichTooltip = styled(({ className, ...props }) => (
  <Tooltip 
    {...props}
    classes={{ popper: className }}
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    maxWidth: 300,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    border: `1px solid ${theme.palette.divider}`,
  },
}));

export default RichTooltip;
