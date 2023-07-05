import { Box, Typography, useTheme, Button } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";

const MissionWidget = () => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const listItems = [
    { id: 1, content: 'Follow 10 people', reward:'100 coins' , progress: '2/10' },
    { id: 2, content: 'Make 10 posts', reward:'100 coins', progress: '2/10'  },
    { id: 3, content: 'Buy 10 post', reward:'100 coins', progress: '0/10'  }
  ];
  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography color={dark} variant="h3" fontWeight="500">
          Tasks
        </Typography>
      </FlexBetween>
      {listItems.map((item) => (
        <Typography sx={{ margin: '16px 0' }}>
          <FlexBetween>
            <Typography color={main} variant="h5" fontWeight="500"
              sx={{
                width: "100%",
              }}>
              {item.content}
            </Typography>
            <Typography color={main} variant="h5" fontWeight="500"
              sx={{
                width: "50%",
              }}>
              {item.progress}
            </Typography>
            <Typography color={main} variant="h6" fontWeight="500"
              sx={{
                width: "50%",
              }}>
              {item.reward}
            </Typography>
            <Button
              sx={{
                color: palette.background.alt,
                backgroundColor: palette.primary.main,
                borderRadius: "2rem",
              }}
            >
              get
            </Button>
          </FlexBetween>
        </Typography>
      ))}
      <Typography color={medium} m="0.5rem 0">
        Completing the task will entitle you to receive additional rewards.
      </Typography>
    </WidgetWrapper>
  );
};

export default MissionWidget;
