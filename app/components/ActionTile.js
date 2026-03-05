import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { tileStyles } from "../../assets/styles/tileStyles";
const ActionTile = ({ item, onPress }) => (
  <TouchableOpacity
    style={[tileStyles.gridItem, { backgroundColor: item.color }]}
    onPress={onPress}
  >
    <Text style={tileStyles.gridItemText}>{item.title}</Text>
  </TouchableOpacity>
);

export default ActionTile;
