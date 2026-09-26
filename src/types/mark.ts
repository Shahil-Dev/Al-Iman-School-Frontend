export interface TSubject {
  id: string;
  name: string;
  code: string;
  fullMarks: number;
  hasMT: boolean;
}

export interface TExam {
  id: string;
  name: string;
  academicYearId: string;
}

export interface TStudentForMark {
  id: string;
  studentIdNo: string;
  rollNo: number;
  firstName: string;
  lastName: string;
  mtMarks?: number;
  terminal?: number;
}

export interface TSingleMarkItem {
  id?: string;
  subjectId: string;
  subject: TSubject;
  fullMarks: number;
  mtMarks: number;
  terminal: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
}

export interface TStudentMarksheet {
  marks: TSingleMarkItem[];
  totalObtainedMarks: number;
  gpa: number;
  resultStatus: 'Passed' | 'Failed';
}