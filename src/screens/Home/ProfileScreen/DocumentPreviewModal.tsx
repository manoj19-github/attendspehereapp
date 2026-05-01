import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';

type Props = {
  visible: boolean;
  title: string;
  docId: number | null;
  onClose: () => void;
  onDownload: (args: any) => void; // dispatch DownloadDocAction(...)
};

const inferTypeFromName = (name: string) => {
  const lower = (name || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.webp')
  )
    return 'image';
  return 'unknown';
};

export const DocumentPreviewModal = ({
  visible,
  title,
  docId,
  onClose,
  onDownload,
}: Props) => {
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState('');
  const [docFilePath, setDocFilePath] = useState<string | null>(null);
  const [docMime, setDocMime] = useState<'pdf' | 'image' | 'unknown'>(
    'unknown',
  );

  const resetPreview = () => {
    setDocLoading(false);
    setDocError('');
    setDocFilePath(null);
    setDocMime('unknown');
  };

  const loadDocument = async () => {
    if (!docId) return;

    try {
      // ✅ old android permission (only needed <29)
      if (Platform.OS === 'android' && Platform.Version < 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      setDocLoading(true);
      setDocError('');
      setDocFilePath(null);

      onDownload({
        payload: { doc_id: docId },
        successCallBack: async (data: any) => {
          try {
            const docName = data?.doc_name || `document_${docId}.pdf`;
            const dataUrl: string = data?.doc_url || '';
            if (!dataUrl) throw new Error('doc_url missing');

            const base64 = dataUrl.includes('base64,')
              ? dataUrl.split('base64,')[1]
              : dataUrl;

            const safeName = (docName || `document_${docId}.pdf`).replace(
              /[^\w.\- ]/g,
              '_',
            );
            const dir =
              Platform.OS === 'android'
                ? RNFS.CachesDirectoryPath
                : RNFS.TemporaryDirectoryPath || RNFS.CachesDirectoryPath;

            const filePath = `${dir}/${safeName}`;
            await RNFS.writeFile(filePath, base64, 'base64');

            setDocFilePath(filePath);
            setDocMime(inferTypeFromName(safeName));
          } catch (e: any) {
            setDocError(e?.message || 'Unable to open document.');
          } finally {
            setDocLoading(false);
          }
        },
      });
    } catch (e: any) {
      setDocLoading(false);
      setDocError(e?.message || 'Unable to open document.');
    }
  };

  // ✅ AUTO LOAD when modal opens or doc changes
  useEffect(() => {
    if (visible && docId) {
      resetPreview();
      loadDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, docId]);

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => {
          onClose();
          resetPreview();
        }}
      />

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Document'}
          </Text>

          <TouchableOpacity
            onPress={() => {
              onClose();
              resetPreview();
            }}
            style={styles.closeBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>📄</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docName} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.subText}>
                {docLoading ? 'Opening…' : 'Secure view inside app'}
              </Text>
            </View>
          </View>

          <View style={styles.previewBox}>
            {docLoading ? (
              <Text style={styles.hint}>Loading…</Text>
            ) : docError ? (
              <Text style={styles.err}>{docError}</Text>
            ) : docFilePath ? (
              docMime === 'pdf' ? (
                <Pdf
                  source={{ uri: `file://${docFilePath}` }}
                  style={styles.pdf}
                  trustAllCerts={false}
                  onError={() => setDocError('Unable to render PDF.')}
                />
              ) : docMime === 'image' ? (
                <Image
                  source={{ uri: `file://${docFilePath}` }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.err}>
                  This file type can’t be previewed inside the app.
                </Text>
              )
            ) : (
              <Text style={styles.hint}>No preview available.</Text>
            )}
          </View>

          {/* ✅ only close button now */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.secondaryBtn}
            onPress={() => {
              onClose();
              resetPreview();
            }}
          >
            <Text style={styles.secondaryTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DocumentPreviewModal;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex:999
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '900',
    color: '#222',
    marginRight: 10,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFF1EC',
    borderWidth: 1,
    borderColor: '#FFD6CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { fontSize: 14, color: '#A62002', fontWeight: '900' },

  body: { padding: 14 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFF7F4',
    borderWidth: 1,
    borderColor: '#FFE6DF',
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD6CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 18 },
  docName: { fontSize: 13.5, fontWeight: '900', color: '#222' },
  subText: { marginTop: 2, fontSize: 12, color: '#8A4B3A', fontWeight: '700' },

  previewBox: {
    height: 360,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF7F4',
    borderWidth: 1,
    borderColor: '#FFE6DF',
    padding: 8,
  },
  hint: {
    textAlign: 'center',
    marginTop: 145,
    color: '#8A4B3A',
    fontWeight: '800',
  },
  err: {
    textAlign: 'center',
    marginTop: 145,
    color: '#A62002',
    fontWeight: '900',
  },

  pdf: { flex: 1, width: '100%' },
  image: { flex: 1, width: '100%' },

  secondaryBtn: {
    backgroundColor: '#FFF1EC',
    borderWidth: 1,
    borderColor: '#FFD6CC',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryTxt: { color: '#A62002', fontSize: 14, fontWeight: '900' },
});
