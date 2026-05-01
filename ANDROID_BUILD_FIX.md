# Android Build Fix Documentation

> **Project:** `asrlm_gig_worker_app`  
> **React Native Version:** `0.81.4`  
> **Last Updated:** April 2026

---

## 1. Problem Summary

When running `npx react-native run-android` on React Native `0.81.4`, the build fails with compilation errors in two native modules:

### 1.1 `react-native-document-picker` (v9.3.1)
- **Error:** `cannot find symbol: GuardedResultAsyncTask`
- **Cause:** React Native `0.75+` removed the internal `GuardedResultAsyncTask` class from `com.facebook.react.bridge`. The library's Android code still depends on it.

### 1.2 `react-native-reanimated` (v3.6.2)
- **Errors:**
  - `cannot find symbol: ReactViewBackgroundDrawable`
  - `cannot find symbol: TRACE_TAG_REACT_JAVA_BRIDGE`
  - `no suitable method found for updateLayout(...)`
  - Missing `UIManager` methods: `replaceExistingNonRootView`, `showPopupMenu`, `dismissPopupMenu`, etc.
- **Cause:** Reanimated `3.6.x` was built for RN `0.72–0.73`. RN `0.81` removed or changed many internal Android APIs.

---

## 2. Fixes Applied

### Fix A — Upgrade `react-native-reanimated`

**Do this first.** No manual patching needed.

```bash
npm install react-native-reanimated@^3.19.1,
```

> **Note:** Ensure your `babel.config.js` includes the Reanimated plugin **as the last item**:
> ```js
> module.exports = {
>   presets: ['module:@react-native/babel-preset'],
>   plugins: [
>     'react-native-reanimated/plugin',
>   ],
> };
> ```

### Fix B — Patch `react-native-document-picker`

This library requires a manual Java patch because v9.3.1 has not released a fix for RN `0.81` yet.

#### Option 1: Manual File Replacement (Quickest for a single machine)

1. Open this file in your editor:
   ```
   node_modules/react-native-document-picker/android/src/main/java/com/reactnativedocumentpicker/RNDocumentPickerModule.java
   ```

2. **Replace the entire file** with the contents provided in **Appendix A** below.

3. Clean and rebuild:
   ```bash
   cd android && ./gradlew clean && cd ..
   npx react-native run-android
   ```

#### Option 2: `patch-package` (Recommended for teams / CI)

This ensures the fix is automatically reapplied after every `npm install`.

**Step 1 — Install `patch-package`:**
```bash
npm install --save-dev patch-package
```

**Step 2 — Apply the Java patch manually once:**
Replace the file at:
```
node_modules/react-native-document-picker/android/src/main/java/com/reactnativedocumentpicker/RNDocumentPickerModule.java
```
with the **Appendix A** code.

**Step 3 — Save the patch:**
```bash
npx patch-package react-native-document-picker
```
This creates `patches/react-native-document-picker+9.3.1.patch`.

**Step 4 — Add the postinstall hook:**
In your `package.json`:
```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

**Step 5 — Commit the patch file:**
```bash
git add patches/react-native-document-picker+9.3.1.patch
```

On any new machine or CI runner, after `npm install`, the patch is applied automatically.

---

## 3. Additional Cleanup

### Remove `react-native-worklets` (if present)
If you previously installed `react-native-worklets`, remove it. It is not needed and forces New Architecture on older setups.

```bash
npm uninstall react-native-worklets
```

### Verify `babel.config.js`
```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
  ],
};
```

---

## 4. Complete Rebuild Checklist

When setting up on a **new machine** or after pulling these changes:

```bash
# 1. Install dependencies
npm install

# 2. (Optional) If patch-package is not in postinstall yet:
# npx patch-package

# 3. Clean Android build
 cd android
 ./gradlew clean
 cd ..

# 4. Run
 npx react-native run-android
```

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `GuardedResultAsyncTask` not found | Document picker not patched | Apply Appendix A patch |
| `ReactViewBackgroundDrawable` not found | Reanimated too old | Upgrade to `3.17.0+` |
| `TRACE_TAG_REACT_JAVA_BRIDGE` not found | Reanimated too old | Upgrade to `3.17.0+` |
| `newArchEnabled` required error | `react-native-worklets` installed | `npm uninstall react-native-worklets` |
| Metro bundler cache issues | Stale JS cache | `npx react-native start --reset-cache` |

---

## Appendix A — Patched `RNDocumentPickerModule.java`

Copy the **entire** contents below into:
```
node_modules/react-native-document-picker/android/src/main/java/com/reactnativedocumentpicker/RNDocumentPickerModule.java
```

```java
package com.reactnativedocumentpicker;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RNDocumentPickerModule extends NativeDocumentPickerSpec {
  public static final String NAME = "RNDocumentPicker";
  private static final int READ_REQUEST_CODE = 41;
  private static final int PICK_DIR_REQUEST_CODE = 42;

  private static final String E_ACTIVITY_DOES_NOT_EXIST = "ACTIVITY_DOES_NOT_EXIST";
  private static final String E_FAILED_TO_SHOW_PICKER = "FAILED_TO_SHOW_PICKER";
  private static final String E_DOCUMENT_PICKER_CANCELED = "DOCUMENT_PICKER_CANCELED";
  private static final String E_UNABLE_TO_OPEN_FILE_TYPE = "UNABLE_TO_OPEN_FILE_TYPE";
  private static final String E_UNKNOWN_ACTIVITY_RESULT = "UNKNOWN_ACTIVITY_RESULT";
  private static final String E_INVALID_DATA_RETURNED = "INVALID_DATA_RETURNED";
  private static final String E_UNEXPECTED_EXCEPTION = "UNEXPECTED_EXCEPTION";

  private static final String OPTION_TYPE = "type";
  private static final String OPTION_MULTIPLE = "allowMultiSelection";
  private static final String OPTION_COPY_TO = "copyTo";

  private static final String FIELD_URI = "uri";
  private static final String FIELD_FILE_COPY_URI = "fileCopyUri";
  private static final String FIELD_COPY_ERROR = "copyError";
  private static final String FIELD_NAME = "name";
  private static final String FIELD_TYPE = "type";
  private static final String FIELD_SIZE = "size";

  private Promise promise;
  private String copyTo;

  public RNDocumentPickerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(activityEventListener);
  }

  private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
      boolean isForeignResult = requestCode != READ_REQUEST_CODE && requestCode != PICK_DIR_REQUEST_CODE;
      if (isForeignResult) {
        return;
      }
      final Promise storedPromise = promise;
      if (storedPromise == null) {
        Log.e(NAME, "promise was null in onActivityResult");
        return;
      }
      if (resultCode == Activity.RESULT_CANCELED) {
        sendError(E_DOCUMENT_PICKER_CANCELED, "User canceled directory picker");
        return;
      }
      if (requestCode == READ_REQUEST_CODE) {
        onShowActivityResult(resultCode, data, storedPromise);
      } else {
        onPickDirectoryResult(resultCode, data);
      }
    }
  };

  private String[] readableArrayToStringArray(ReadableArray readableArray) {
    int size = readableArray.size();
    String[] array = new String[size];
    for (int i = 0; i < size; ++i) {
      array[i] = readableArray.getString(i);
    }
    return array;
  }

  @Override
  public void invalidate() {
    getReactApplicationContext().removeActivityEventListener(activityEventListener);
    super.invalidate();
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void pick(ReadableMap args, Promise promise) {
    Activity currentActivity = getCurrentActivity();
    this.promise = promise;
    this.copyTo = args.hasKey(OPTION_COPY_TO) ? args.getString(OPTION_COPY_TO) : null;

    if (currentActivity == null) {
      sendError(E_ACTIVITY_DOES_NOT_EXIST, "Current activity does not exist");
      return;
    }

    try {
      Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
      intent.addCategory(Intent.CATEGORY_OPENABLE);

      intent.setType("*/*");
      if (!args.isNull(OPTION_TYPE)) {
        ReadableArray types = args.getArray(OPTION_TYPE);
        if (types != null) {
          if (types.size() > 1) {
            String[] mimeTypes = readableArrayToStringArray(types);
            intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
            intent.setType(String.join("|",mimeTypes));
          } else if (types.size() == 1) {
            intent.setType(types.getString(0));
          }
        }
      }

      boolean multiple = !args.isNull(OPTION_MULTIPLE) && args.getBoolean(OPTION_MULTIPLE);
      intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple);

      currentActivity.startActivityForResult(intent, READ_REQUEST_CODE, Bundle.EMPTY);
    } catch (ActivityNotFoundException e) {
      sendError(E_UNABLE_TO_OPEN_FILE_TYPE, e.getLocalizedMessage());
    } catch (Exception e) {
      e.printStackTrace();
      sendError(E_FAILED_TO_SHOW_PICKER, e.getLocalizedMessage());
    }
  }

  @ReactMethod
  public void pickDirectory(Promise promise) {
    Activity currentActivity = getCurrentActivity();

    if (currentActivity == null) {
      promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Current activity does not exist");
      return;
    }
    this.promise = promise;
    try {
      Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
      currentActivity.startActivityForResult(intent, PICK_DIR_REQUEST_CODE, null);
    } catch (Exception e) {
      sendError(E_FAILED_TO_SHOW_PICKER, "Failed to create directory picker", e);
    }
  }

  @Override
  public void releaseSecureAccess(ReadableArray uris, Promise promise) {
    promise.reject("RNDocumentPicker:releaseSecureAccess", "releaseSecureAccess is not supported on Android");
  }

  private void onPickDirectoryResult(int resultCode, Intent data) {
    if (resultCode != Activity.RESULT_OK) {
      sendError(E_UNKNOWN_ACTIVITY_RESULT, "Unknown activity result: " + resultCode);
      return;
    }

    if (data == null || data.getData() == null) {
      sendError(E_INVALID_DATA_RETURNED, "Invalid data returned by intent");
      return;
    }
    Uri uri = data.getData();

    WritableMap map = Arguments.createMap();
    map.putString(FIELD_URI, uri.toString());
    promise.resolve(map);
  }

  public void onShowActivityResult(int resultCode, Intent data, Promise promise) {
    if (resultCode != Activity.RESULT_OK) {
      sendError(E_UNKNOWN_ACTIVITY_RESULT, "Unknown activity result: " + resultCode);
      return;
    }
    Uri uri = null;
    ClipData clipData = null;

    if (data != null) {
      uri = data.getData();
      clipData = data.getClipData();
    }

    try {
      List<Uri> uris = new ArrayList<>();
      if (clipData != null && clipData.getItemCount() > 0) {
        final int length = clipData.getItemCount();
        for (int i = 0; i < length; ++i) {
          ClipData.Item item = clipData.getItemAt(i);
          uris.add(item.getUri());
        }
      } else if (uri != null) {
        uris.add(uri);
      } else {
        sendError(E_INVALID_DATA_RETURNED, "Invalid data returned by intent");
        return;
      }

      new ProcessDataTask(getReactApplicationContext(), uris, copyTo, promise).execute();
    } catch (Exception e) {
      sendError(E_UNEXPECTED_EXCEPTION, e.getLocalizedMessage(), e);
    }
  }

  private static class ProcessDataTask extends AsyncTask<Void, Void, ReadableArray> {
    private final WeakReference<Context> weakContext;
    private final List<Uri> uris;
    private final String copyTo;
    private final Promise promise;

    ProcessDataTask(ReactContext reactContext, List<Uri> uris, String copyTo, Promise promise) {
      this.weakContext = new WeakReference<>(reactContext.getApplicationContext());
      this.uris = uris;
      this.copyTo = copyTo;
      this.promise = promise;
    }

    @Override
    protected ReadableArray doInBackground(Void... params) {
      try {
        WritableArray results = Arguments.createArray();
        for (Uri uri : uris) {
          results.pushMap(getMetadata(uri));
        }
        return results;
      } catch (Exception e) {
        return null;
      }
    }

    @Override
    protected void onPostExecute(ReadableArray readableArray) {
      if (readableArray != null) {
        promise.resolve(readableArray);
      } else {
        promise.reject(E_UNEXPECTED_EXCEPTION, "Failed to process documents");
      }
    }

    private WritableMap getMetadata(Uri uri) {
      Context context = weakContext.get();
      if (context == null) {
        return Arguments.createMap();
      }
      ContentResolver contentResolver = context.getContentResolver();
      WritableMap map = Arguments.createMap();
      map.putString(FIELD_URI, uri.toString());
      map.putString(FIELD_TYPE, contentResolver.getType(uri));
      try (Cursor cursor = contentResolver.query(uri, null, null, null, null, null)) {
        if (cursor != null && cursor.moveToFirst()) {
          int displayNameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
          if (!cursor.isNull(displayNameIndex)) {
            String fileName = cursor.getString(displayNameIndex);
            map.putString(FIELD_NAME, fileName);
          } else {
            map.putNull(FIELD_NAME);
          }
          int mimeIndex = cursor.getColumnIndex(DocumentsContract.Document.COLUMN_MIME_TYPE);
          if (!cursor.isNull(mimeIndex)) {
            map.putString(FIELD_TYPE, cursor.getString(mimeIndex));
          }
          int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
          if (cursor.isNull(sizeIndex)) {
            map.putNull(FIELD_SIZE);
          } else {
            map.putDouble(FIELD_SIZE, cursor.getLong(sizeIndex));
          }
        }
      }

      prepareFileUri(context, map, uri);
      return map;
    }

    private void prepareFileUri(Context context, WritableMap map, Uri uri) {
      if (copyTo == null) {
        map.putNull(FIELD_FILE_COPY_URI);
      } else {
        copyFileToLocalStorage(context, map, uri);
      }
    }

    private void copyFileToLocalStorage(Context context, WritableMap map, Uri uri) {
      File dir = context.getCacheDir();
      if (copyTo.equals("documentDirectory")) {
        dir = context.getFilesDir();
      }
      dir = new File(dir, UUID.randomUUID().toString());
      try {
        boolean didCreateDir = dir.mkdir();
        if (!didCreateDir) {
          throw new IOException("failed to create directory at " + dir.getAbsolutePath());
        }
        String fileName = map.getString(FIELD_NAME);
        if (fileName == null) {
          fileName = String.valueOf(System.currentTimeMillis());
        }
        File destFile = safeGetDestination(new File(dir, fileName), dir.getCanonicalPath());
        Uri copyPath = copyFile(context, uri, destFile);
        map.putString(FIELD_FILE_COPY_URI, copyPath.toString());
      } catch (Exception e) {
        e.printStackTrace();
        map.putNull(FIELD_FILE_COPY_URI);
        map.putString(FIELD_COPY_ERROR, e.getLocalizedMessage());
      }
    }

    public File safeGetDestination(File destFile, String expectedDir) throws IllegalArgumentException, IOException {
      String canonicalPath = destFile.getCanonicalPath();
      if (!canonicalPath.startsWith(expectedDir)) {
        throw new IllegalArgumentException("The copied file is attempting to write outside of the target directory.");
      }
      return destFile;
    }

    public static Uri copyFile(Context context, Uri uri, File destFile) throws IOException {
      try(InputStream inputStream = context.getContentResolver().openInputStream(uri);
          FileOutputStream outputStream = new FileOutputStream(destFile)) {
        byte[] buf = new byte[8192];
        int len;
        while ((len = inputStream.read(buf)) > 0) {
          outputStream.write(buf, 0, len);
        }
        return Uri.fromFile(destFile);
      }
    }
  }

  private void sendError(String code, String message) {
    sendError(code, message, null);
  }

  private void sendError(String code, String message, Exception e) {
    Promise temp = this.promise;
    if (temp != null) {
      this.promise = null;
      temp.reject(code, message, e);
    }
  }
}
```

---

## Appendix B — `package.json` Dependencies (Verified Working)

Key versions that compile successfully on RN `0.81.4`:

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.81.4",
    "react-native-document-picker": "^9.3.1",
    "react-native-reanimated": "^3.17.0"
  },
  "devDependencies": {
    "patch-package": "^8.0.0"
  },
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

---

*End of Document*
