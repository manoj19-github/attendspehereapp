import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React from 'react';
import { Download } from 'lucide-react-native';
import EmptyHint from './EmptyHint';

interface DocumentsCardViewProps {
  docs?: any[];
  onPressDocument?: (doc: any) => void;
}

const DocumentsCardView = ({
  docs = [],
  onPressDocument,
}: DocumentsCardViewProps) => {
  //   const openDocument = (doc: any) => {
  //     if (!doc?.doc_path) return;

  //     // since you said NO base url needed
  //     Linking.openURL(doc.doc_path).catch(err =>
  //       console.log('Error opening file:', err),
  //     );
  //   };

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleGroup}>
          <Download size={18} color="#EF6C00" />
          <Text style={styles.sectionTitle}>Documents</Text>
        </View>
      </View>

      {docs.length === 0 ? (
        <EmptyHint text="No documents available." />
      ) : (
        docs.map((doc: any) => (
          <TouchableOpacity
            key={doc.doc_id}
            style={styles.downloadRow}
            activeOpacity={0.7}
            onPress={() => onPressDocument?.(doc)}
          >
            <Text style={styles.downloadText}>
              {doc?.doc_type_name || doc?.doc_name || 'Document'}
            </Text>
            <Download size={18} color="#EF6C00" />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default DocumentsCardView;

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF3E0',
  },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  downloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  downloadText: { fontSize: 13, color: '#555', fontWeight: '600' },
});
