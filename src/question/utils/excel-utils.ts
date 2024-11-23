import * as XLSX from 'xlsx';
import { Question } from '../entity/question.entity';

export function formatQuestionsForExcel(questions: Question[]): any[] {
  return questions.map((question) => {
    let options = [];
    let questionType = '';

    switch (question.prompt.type) {
      case 'MULTIPLE_CHOICE_QUESTION':
        questionType = 'Multiple Choice';
        options = question.variants.map((variant) => variant.variant);
        break;

      case 'TRUE_OR_FALSE_QUESTION':
        questionType = 'True/False';
        options = ['True', 'False'];
        break;

      case 'SHORT_ANSWER_QUESTION':
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
  const headers = [
    'Question Text',
    'Type',
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
}
