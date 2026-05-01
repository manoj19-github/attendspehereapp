import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ImageURISource } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

interface CachedImageProps {
    imageUrl: string | null;
    style?: object;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    defaultImage?: ImageURISource;
}

const CachedImage: React.FC<CachedImageProps> = ({
    imageUrl,
    style = {},
    resizeMode = 'cover',
    defaultImage = require('../assets/logo.png')
}) => {
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);

    // Key for AsyncStorage (based on image URL)
    const getStorageKey = (url: string): string => `cached_image_${url}`;

    // Function to get image filename from URL
    const getImageFilename = (url: string): string => {
        return url.split('/').pop()?.split('?')[0] || `image-${Date.now()}.jpg`;
    };

    // Clear previous cache when URL changes
    const clearPreviousCache = async (url: string | null) => {
        if (currentUrl && currentUrl !== url) {
            try {
                const storageKey = getStorageKey(currentUrl);
                const cachedPath = await AsyncStorage.getItem(storageKey);

                if (cachedPath) {
                    await RNFS.unlink(cachedPath).catch(() => { });
                    await AsyncStorage.removeItem(storageKey);
                }
            } catch (error) {
                console.error('Error clearing previous cache:', error);
            }
        }
        setCurrentUrl(url);
    };

    // Check if image exists in local storage and filesystem
    const getCachedImagePath = async (url: string): Promise<string | null> => {
        try {
            const storageKey = getStorageKey(url);
            const cachedPath = await AsyncStorage.getItem(storageKey);

            if (cachedPath) {
                const fileExists = await RNFS.exists(cachedPath);
                if (fileExists) {
                    return cachedPath;
                }
                // Remove invalid cache entry
                await AsyncStorage.removeItem(storageKey);
            }
            return null;
        } catch (error) {
            console.error('Error checking cached image:', error);
            return null;
        }
    };

    // Download and cache image
    const downloadAndCacheImage = async (url: string): Promise<string | null> => {
        try {
            setError(false);
            const filename = getImageFilename(url);
            const path = `${RNFS.DocumentDirectoryPath}/${filename}`;

            // Download the file
            await RNFS.downloadFile({
                fromUrl: url,
                toFile: path,
            }).promise;

            // Store in AsyncStorage
            const storageKey = getStorageKey(url);
            await AsyncStorage.setItem(storageKey, path);

            return path;
        } catch (error) {
            console.error('Error downloading image:', error);
            setError(true);
            return null;
        }
    };

    // Main function to handle image caching
    const handleImageCaching = async (url: string | null) => {
        if (!url) {
            setImagePath(null);
            return;
        }

        try {
            // Clear previous cache if URL changed
            await clearPreviousCache(url);

            // First check cache
            const cachedPath = await getCachedImagePath(url);

            if (cachedPath) {
                setImagePath(cachedPath);
            } else {
                // If not cached, download and store
                const newPath = await downloadAndCacheImage(url);
                setImagePath(newPath);
            }
        } catch (error) {
            console.error('Error handling image caching:', error);
            setError(true);
        }
    };

    useEffect(() => {
        handleImageCaching(imageUrl);
    }, [imageUrl]);

    return (
        <View style={[styles.container, style]}>
            {error || !imagePath ? (
                <Image
                    source={defaultImage}
                    style={[styles.image, style]}
                    resizeMode={resizeMode}
                />
            ) : (
                <Image
                    source={{ uri: `file://${imagePath}` }}
                    style={[styles.image, style]}
                    resizeMode={resizeMode}
                    onError={() => setError(true)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default CachedImage;