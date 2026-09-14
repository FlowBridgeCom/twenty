import { styled } from '@linaria/react';

import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  justify-content: center;
  min-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH};
  padding-right: ${themeCssVariables.spacing[1]};
  width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH};
`;

export const RecordTableCellCheckboxPlaceholder = () => {
  const { hasUserSelectedAllRows } = useRecordTableBodyContextOrThrow();

  return (
    <RecordTableCellStyleWrapper
      isSelected={hasUserSelectedAllRows}
      hasRightBorder={false}
      widthClassName={RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME}
    >
      <StyledContainer data-select-disable>
        {/* EXPERIMENT: skeleton rows rendered a live controlled checkbox
            input. React's updateInput rewrites name (twice) and type on every
            input on every commit, unconditionally, so 160 placeholder rows
            cost ~960 no-op DOM attribute writes per interaction. */}
      </StyledContainer>
    </RecordTableCellStyleWrapper>
  );
};
