import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { tileStyles } from '@/assets/styles/tileStyles';
import type { TileItem } from '../types';

export interface WidgetTileProps {
    item: TileItem;
    onPress: () => void;
}

const WidgetTile: React.FC<WidgetTileProps> = ({ item, onPress }) => (
    <TouchableOpacity
        style={[tileStyles.gridItem, { backgroundColor: item.color }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Text style={tileStyles.gridItemText}>{item.title}</Text>
    </TouchableOpacity>
);

export default WidgetTile;
