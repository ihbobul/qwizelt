import * as XLSX from 'xlsx';

import { Question } from '../entity/question.entity';
import { QuestionType } from '../enum/question-type.enum';

const QUESTION_HEADERS = [
  'Question Text',
  'Type',
  'Option 1',
  'Option 2',
  'Option 3',
  'Option 4',
];

export function formatQuestionsForExcel(questions: Question[]): any[] {
  return questions.map((question) => {
    let options = [];
    let questionType = '';

    switch (question.prompt.type) {
      case QuestionType.MCQ:
        questionType = 'Multiple Choice';
        options = question.variants.map((variant) => variant.variant);
        break;

      case QuestionType.TRUE_FALSE:
        questionType = 'True/False';
        options = ['True', 'False'];
        break;

      case QuestionType.SHORT_ANSWER:
        questionType = 'Short Answer';
        options = [];
        break;

      default:
        questionType = 'Unknown';
    }

    const rowData = [question.question, questionType, ...options];
    while (rowData.length < 4) {
      rowData.push('');
    }

    return rowData;
  });
}

export function createExcelBuffer(data: any[]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet([QUESTION_HEADERS, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
}
