import { type ReactNode, useCallback, useMemo, useRef } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordTableContextProvider as RecordTableContextInternalProvider } from '@/object-record/record-table/contexts/RecordTableContext';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordUpdateHookParams } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { RECORD_TABLE_COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnMinWidth';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useIsTouchDevice } from 'twenty-ui/utilities';
import { OpenRecordIn } from 'twenty-shared/types';

type RecordTableContextProviderProps = {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  onRecordIdentifierClick?: (rowIndex: number, recordId: string) => void;
  children: ReactNode;
};

// Hoisted: a literal here would be a new identity every render, and every
// consumer of this context re-renders when the value identity changes.
const RECORD_FIELDS_SCOPE_CONTEXT_VALUE = {
  scopeInstanceId: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
};

export const RecordTableContextProvider = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
  onRecordIdentifierClick,
  children,
}: RecordTableContextProviderProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const { updateOneRecord } = useUpdateOneRecord();

  // useUpdateOneRecord builds updateOneRecord inline and returns it in a fresh
  // object, so it has a new identity on every render. Depending on it directly
  // made this useCallback recompute every render, which in turn gave
  // RecordTableUpdateContext a new value every render. Hold it in a ref so the
  // callback identity is stable while still invoking the latest closure.
  const updateOneRecordRef = useRef(updateOneRecord);
  updateOneRecordRef.current = updateOneRecord;

  const updateRecord = useCallback(
    ({ variables }: RecordUpdateHookParams) => {
      updateOneRecordRef.current({
        objectNameSingular,
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    },
    [objectNameSingular],
  );

  const openRecordIn = useResolveOpenRecordIn(objectNameSingular);

  const isTouchDevice = useIsTouchDevice();

  // Was inlined in the JSX below, allocating a new array of new objects on
  // every render even when the fields were unchanged.
  const sizedVisibleRecordFields = useMemo(
    () =>
      visibleRecordFields.map((field) => ({
        ...field,
        size: Math.max(field.size, RECORD_TABLE_COLUMN_MIN_WIDTH),
      })),
    [visibleRecordFields],
  );

  // Navigating on mouse down only buys a frame on a real pointer: a tap
  // synthesises its mouse events after the finger is already gone.
  const triggerEvent =
    openRecordIn === OpenRecordIn.SIDE_PANEL || isTouchDevice
      ? 'CLICK'
      : 'MOUSE_DOWN';

  // React compares context values by identity, and context propagation bypasses
  // React.memo: an unmemoised literal here re-renders every consumer on every
  // render of this provider. 30 of those consumers are on the per-row and
  // per-cell path, so that is the whole rendered table (1,200-1,680 cells).
  const recordTableContextValue = useMemo(
    () => ({
      viewBarId,
      objectMetadataItem,
      objectMetadataItems,
      recordTableId,
      objectNameSingular,
      objectPermissions,
      visibleRecordFields: sizedVisibleRecordFields,
      onRecordIdentifierClick,
      triggerEvent,
    }),
    [
      viewBarId,
      objectMetadataItem,
      objectMetadataItems,
      recordTableId,
      objectNameSingular,
      objectPermissions,
      sizedVisibleRecordFields,
      onRecordIdentifierClick,
      triggerEvent,
    ],
  );

  return (
    <RecordFieldsScopeContextProvider value={RECORD_FIELDS_SCOPE_CONTEXT_VALUE}>
      <RecordTableContextInternalProvider value={recordTableContextValue}>
        <RecordTableUpdateContext.Provider value={updateRecord}>
          {children}
        </RecordTableUpdateContext.Provider>
      </RecordTableContextInternalProvider>
    </RecordFieldsScopeContextProvider>
  );
};
