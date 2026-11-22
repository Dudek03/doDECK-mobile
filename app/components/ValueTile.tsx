import React from 'react';
import { View, Text } from 'react-native';
import { tileStyles } from '@/assets/styles/tileStyles';
import type { TileItem } from '../types';

export interface ValueTileProps {
    item: TileItem;
    value: number | string;
}

const ValueTile: React.FC<ValueTileProps> = ({ item, value }) => (
    <View style={[tileStyles.gridItem, { backgroundColor: item.color }]}>
        <Text style={tileStyles.gridItemText}>{item.title}</Text>
        <Text style={tileStyles.largeValueText}>{value}%</Text>
    </View>
);

export default ValueTile;
