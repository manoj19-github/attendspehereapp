import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RegisterSectionCard from './RegisterSectionCard';
import DropDownFieldRN from '../../components/DropDownFieldRN';
import { Picker } from '@react-native-picker/picker';
import PhotoPickerSheet from '../../components/PhotoPickerSheet';

interface Props {
  control: any;
  errors: any;
  watch: any;
  docOptions: any;
  setValue: any;
  pickFromGalleryForDoc?: any;
  pickFromCameraForDoc?: any;
  pickFileFromGalleryForDoc?: any;
  setShowPickerForDoc?: any;
  showPickerForDoc?: any;
  selectedDocType?: any;
  setSelectedDocType?: any;
  documentsList?: any[];
  handleDeleteDocument?: (docId: string) => void;
}

const DocumentsStep = ({
  errors,
  watch,
  docOptions,
  setValue,
  pickFromGalleryForDoc,
  pickFromCameraForDoc,
  pickFileFromGalleryForDoc,
  setShowPickerForDoc,
  showPickerForDoc,
  selectedDocType,
  setSelectedDocType,
  documentsList = [],
  handleDeleteDocument,
}: Props) => {
  const [docTypeError, setDocTypeError] = React.useState(false);
  return (
    <RegisterSectionCard
      title="Additional Documents"
      subtitle="Add any extra supporting documents required for your profile."
    >
      <View style={styles.grid}>
        <DropDownFieldRN
          label="Addition Document"
          required
          value={selectedDocType}
          onChange={(v: any) => {
            setSelectedDocType(v);
            setValue('additional_documents', watch('additional_documents'), {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          error={errors?.additional_documents?.message}
          fieldStyle={{ width: '100%' }}
        >
          <Picker.Item label="Select Document Type" value="" />

          {/* {docOptions &&
            docOptions.length > 0 &&
            docOptions.map((d: any) => (
              <Picker.Item
                label={d.domain_value}
                value={d.domain_code}
                key={d.domain_code}
              />
            ))} */}
          {docOptions &&
            docOptions.length > 0 &&
            docOptions
              ?.filter((t: any) =>
                ['1', '3', '4', '5'].includes(String(t.domain_code)),
              )
              .map((d: any) => (
                <Picker.Item
                  label={d.domain_value}
                  value={d.domain_code}
                  key={d.domain_code}
                />
              ))}
        </DropDownFieldRN>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => {
            if (!selectedDocType) {
              setDocTypeError(true);
              return;
            }

            setDocTypeError(false);
            setShowPickerForDoc(true);
          }}
        >
          <Text style={styles.uploadBtnText}>Upload Additional Document</Text>
        </TouchableOpacity>

        {docTypeError && (
          <Text style={styles.errorText}>
            Please select document type first.
          </Text>
        )}

        {documentsList.length > 0 ? (
          <View style={styles.listWrap}>
            {documentsList.map((item, index) => (
              <View key={item.id} style={styles.docCard}>
                <View style={styles.docInfo}>
                  <Text style={styles.docIndex}>#{index + 1}</Text>
                  <Text style={styles.docType}>{item.docTypeLabel}</Text>
                  <Text style={styles.docFileName} numberOfLines={2}>
                    {item.fileName}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteDocument?.(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {errors?.additional_documents && documentsList.length === 0 && (
          <Text style={styles.errorText}>
            Please upload at least one document.
          </Text>
        )}
      </View>

      <PhotoPickerSheet
        visible={showPickerForDoc}
        onClose={() => setShowPickerForDoc(false)}
        onCamera={pickFromCameraForDoc}
        onGallery={pickFromGalleryForDoc}
        onFileGallery={pickFileFromGalleryForDoc}
        photoPickerTitle="Upload Document"
        photoPickerSubTitle1="Take Photo"
        photoPickerSubTitle2="Choose Image"
        photoPickerSubTitle3="Upload PDF File"
        isFileUploadReq={true}
      />
    </RegisterSectionCard>
  );
};

export default DocumentsStep;

const styles = StyleSheet.create({
  grid: {
    rowGap: 8,
  },
  uploadBtn: {
    width: '100%',
    backgroundColor: '#FFF4EA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD3AE',
    paddingVertical: 14,
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#E46A2E',
    fontWeight: '900',
    fontSize: 13.5,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 4,
  },
  listWrap: {
    marginTop: 8,
    rowGap: 8,
  },
  docCard: {
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#FFD9BB',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  docInfo: {
    flex: 1,
  },
  docIndex: {
    fontSize: 11,
    color: '#9A6B4A',
    fontWeight: '700',
    marginBottom: 2,
  },
  docType: {
    fontSize: 13,
    color: '#E46A2E',
    fontWeight: '900',
  },
  docFileName: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F5C2C2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deleteBtnText: {
    color: '#D14343',
    fontSize: 12,
    fontWeight: '800',
  },
});
