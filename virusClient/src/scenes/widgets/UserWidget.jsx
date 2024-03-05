import {
  ManageAccountsOutlined,
  EditOutlined,
  LocationOnOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material";
import { Box, Typography, Divider, useTheme } from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WalletConnectComponent from '../../WalletConnectComponent';
import Friend from "components/Friend";

const UserWidget = ({ userId, picturePath }) => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [user, setUser] = useState(null);
  const { palette } = useTheme();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const login_id = useSelector((state) => state.user._id);
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;

  const getUser = async () => {
    const response = await fetch(`http://localhost:3002/users/${userId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setUser(data);
    setProfile(data.description);
    setInputValue(data.description);
  };

  const handleEditClick = () => {
    setEditing(!editing); // Toggle the editing state
    // Add any additional logic you need here
  };

  const handleCancelClick = () => {
    setEditing(false); // Exit editing mode
    setInputValue(profile);
  };

  const handleSaveClick = async () => {
    setEditing(false); // Exit editing mode
    setProfile(inputValue);
    const response = await fetch(`http://localhost:3002/users/description`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          user_id: userId,
          description: inputValue,
      }),
    });
    const update = await response.json();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update input value
  };

  useEffect(() => {
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }
  // {"picturePath":"public/assets/00009-4284122733.png","_id":"1"}
  const {
    _id,
    user_name,
    // picturePath,
    holding,
    subscriber,
    description,
    // postCount,
  } = user;

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}
      <Friend
          friend_id={userId}
          name={user_name}
          subscriber={subscriber}
          user_picture_path={picturePath}
          is_main={true}
      />

      <WalletConnectComponent holding={holding}>
      </WalletConnectComponent>

      <Divider />

      {/* SECOND ROW */}
      <Box p="1rem 0">
        <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
          <FlexBetween gap="1rem">
            Social Profiles
            {login_id == userId && (
              <EditOutlined sx={{ color: main }} onClick={handleEditClick} />
            )}
          </FlexBetween>
        </Typography>
        {editing ? (
          // Editing mode components
          <div>
            <input
              type="text"
              style={{ width: '80%', padding: '0.5rem', marginBottom: '1rem' }}
              placeholder="Edit your social profile"
              value={inputValue}
              onChange={handleInputChange}
            />
            <button onClick={handleCancelClick} style={{ marginRight: '0.5rem' }}>Cancel</button>
            <button onClick={handleSaveClick}>Save</button>
          </div>
        ) : (
          // Display mode components
          <div>
            {/* Display social profiles here */}
            <p>{profile}</p>
          </div>
        )}
      </Box>

      <Divider />

      {/* THIRD ROW */}
      <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Number of posts</Typography>
          <Typography color={main} fontWeight="500">
            {/* {postCount} */}
          </Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography color={medium}>Total post worth</Typography>
          <Typography color={main} fontWeight="500">
            postWorth
          </Typography>
        </FlexBetween>
      </Box>
    </WidgetWrapper>
  );
};

export default UserWidget;
