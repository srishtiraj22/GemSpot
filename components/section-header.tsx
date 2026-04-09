/**
 * SectionHeader — Title + "See All" link
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Layout } from '@/constants/theme';

interface SectionHeaderProps {
    title: string;
    emoji?: string;
    onSeeAll?: () => void;
    showSeeAll?: boolean;
}

export function SectionHeader({ title, emoji, onSeeAll, showSeeAll = true }: SectionHeaderProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {emoji ? `${emoji} ` : ''}{title}
            </Text>
            {showSeeAll && onSeeAll && (
                <Pressable style={styles.seeAll} onPress={onSeeAll}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Layout.sectionSpacing,
        marginBottom: Layout.sectionPaddingBottom,
        paddingHorizontal: Layout.screenPadding,
    },
    title: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
    },
    seeAll: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        ...Typography.body,
        color: Colors.primary,
        fontWeight: '500',
    },
});
