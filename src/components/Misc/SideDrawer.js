import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaBell, FaSearch } from "react-icons/fa";
import { useChat } from "../../context/chatContext";
import ProfileModal from "../Models/ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";
import UserList from "../Shared/UserList";
import { getSender } from "../../helpers/Logics";


const SideDrawer = () => {
  const [search, setSearch] = useState("all");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const toast = useToast();

  const {
    user,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = useChat();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    window.location.reload();
    navigate("/");
  };

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    try {
      if (search === "all") {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `https://chatmingle-backend.onrender.com/api/v1/user/allusers`,
          config
        );
        setSearchResult(data.users);
        setLoading(false);
      } else {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `https://chatmingle-backend.onrender.com/api/v1/user/allusers?search=${search}`,
          config
        );
        setSearchResult(data.users);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Create Chat
  const createChatHandler = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "https://chatmingle-backend.onrender.com/api/v1/chat/create",
        { userId },
        config
      );
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data.users, ...chats]);
      }
      setSelectedChat(data);
      setLoadingChat(false);
      window.location.reload();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        w={"100%"}
        p={"5px 10px 5px 10px"}
        borderWidth={"5px"}
      >
        <Tooltip
          label="Search User To Chat With"
          hasArrow
          placement="bottom-end"
        >
          <Button variant={"ghost"} onClick={onOpen} ref={btnRef}>
            <FaSearch />
          </Button>
        </Tooltip>
        <Text fontSize={"2xl"} fontWeight={900}>
          Chat Mingle
        </Text>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Menu>
            <MenuButton p={1}>
              <FaBell style={{ fontSize: "30px" }} />
              {/* Menu List */}
              <MenuList pl={2}>
                {!notification.length && "No New Messages"}
                {notification.map((notify) => (
                  <MenuItem
                    key={notify._id}
                    onClick={() => {
                      setSelectedChat(notify.chat);
                      setNotification(notification.filter((n) => n !== notify));
                    }}
                  >
                    {notify.chat.isGroupChat
                      ? `New Message in ${notify.chat.chatName}`
                      : `New Message From ${getSender(
                          user,
                          notify.chat.users
                        )}`}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuButton>
          </Menu>
          <Menu>
            <MenuButton p={1}>
              <Avatar
                size={"sm"}
                cursor={"pointer"}
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Search the users</DrawerHeader>

          <DrawerBody>
            <Box display={"flex"} pb={2}>
              <Input
                placeholder="Search By Name or Email"
                mr={2}
                value={search}
                onChange={handleSearch}
              />
            </Box>
            {loading ? (
              <Loader />
            ) : (
              <>
                {searchResult?.map((user, index) => (
                  <UserList
                    key={index}
                    user={user}
                    handleFunction={() => createChatHandler(user._id)}
                  />
                ))}
              </>
            )}
            {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
