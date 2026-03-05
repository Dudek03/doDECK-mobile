import React from "react";
import { View, Text } from "react-native";
import { tileStyles } from "@/assets/styles/tileStyles";
const ValueTile = ({ item, value }) => (
  <View style={[tileStyles.gridItem, { backgroundColor: item.color }]}>
    <Text style={tileStyles.gridItemText}>{item.title}</Text>
    <Text style={tileStyles.largeValueText}>{value}%</Text>
  </View>
);

export default ValueTile;
