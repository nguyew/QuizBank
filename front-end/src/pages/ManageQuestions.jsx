import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuestions,
  createQuestion,
  createQuestionInQuiz,
  attachQuestionToQuiz,
  updateQuestion,
  deleteQuestion
} from '../store/questionSlice';
import { fetchQuizzes } from '../store/quizSlice';
import Navbar from '../components/NavBar';

const emptyForm = { text: '', options: ['', '', '', ''], correctAnswerIndex: 0 };

function ManageQuestions() {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.questions);
  const quizzes = useSelector((state) => state.quizzes.list);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [quizChoice, setQuizChoice] = useState(null); // null = chưa chọn -> mặc định quiz đầu tiên
  const [error, setError] = useState(null);
  // Gắn câu hỏi có sẵn vào quiz: quiz đang chọn theo từng câu hỏi, câu đang xử lý, lỗi (nếu có)
  const [attachChoice, setAttachChoice] = useState({});
  const [attachingId, setAttachingId] = useState(null);
  const [attachError, setAttachError] = useState(null);

  // '' nghĩa là "không thuộc quiz nào"
  const quizId = quizChoice ?? quizzes[0]?._id ?? '';

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleOptionChange = (idx, value) => {
    const newOptions = [...form.options];
    newOptions[idx] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      text: form.text,
      options: form.options,
      correctAnswerIndex: Number(form.correctAnswerIndex)
    };
    try {
      if (editingId) {
        await dispatch(updateQuestion({ id: editingId, questionData: payload })).unwrap();
      } else if (quizId) {
        await dispatch(createQuestionInQuiz({ quizId, questionData: payload })).unwrap();
        dispatch(fetchQuizzes()); // cập nhật nhãn "thuộc quiz nào"
      } else {
        await dispatch(createQuestion(payload)).unwrap();
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      // Giữ nguyên form để admin sửa lại, và hiện lý do server từ chối
      setError(typeof err === 'string' ? err : err?.message || 'Something went wrong');
    }
  };

  const handleEdit = (question) => {
    setError(null);
    setForm({
      text: question.text,
      options: question.options,
      correctAnswerIndex: question.correctAnswerIndex
    });
    setEditingId(question._id);
  };

  const handleCancelEdit = () => {
    setError(null);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    await dispatch(deleteQuestion(id));
    dispatch(fetchQuizzes()); // backend đã gỡ câu hỏi khỏi quiz, tải lại để nhãn đúng
  };

  const handleAttach = async (questionId, targetQuizId) => {
    setAttachError(null);
    setAttachingId(questionId);
    try {
      await dispatch(attachQuestionToQuiz({ quizId: targetQuizId, questionId })).unwrap();
      await dispatch(fetchQuizzes()); // cập nhật nhãn và danh sách quiz còn có thể thêm
      setAttachChoice((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    } catch (err) {
      setAttachError({
        id: questionId,
        message: typeof err === 'string' ? err : err?.message || 'Something went wrong'
      });
    } finally {
      setAttachingId(null);
    }
  };

  // Các quiz đang chứa câu hỏi này (GET /quizzes đã populate sẵn questions)
  const quizzesOf = (question) =>
    quizzes.filter((quiz) => quiz.questions?.some((q) => (q._id ?? q) === question._id));

  return (
    <div className="container mt-4">
      <Navbar
        links={{
          title: 'Admin Dashboard',
          items: [
            { to: '/admin', label: 'Home' },
            { to: '/admin/questions', label: 'Manage Questions' }
          ]
        }}
      />

      <h3>Questions</h3>
      <form onSubmit={handleSubmit} className="border rounded p-3 mb-4">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Question Text:</label>
          <input
            className="form-control"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Options:</label>
          {form.options.map((opt, idx) => (
            <input
              key={idx}
              className="form-control mb-2"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
          ))}
        </div>
        <div className="mb-3">
          <label className="form-label">Correct Answer Index:</label>
          <input
            type="number"
            className="form-control"
            value={form.correctAnswerIndex}
            onChange={(e) => setForm({ ...form, correctAnswerIndex: e.target.value })}
            min="0"
            max="3"
            required
          />
        </div>
        {editingId ? (
          <p className="text-muted">Editing a question. Its quiz cannot be changed here.</p>
        ) : (
          <div className="mb-3">
            <label className="form-label" htmlFor="quizSelect">Add to quiz:</label>
            <select
              id="quizSelect"
              className="form-select"
              value={quizId}
              onChange={(e) => setQuizChoice(e.target.value)}
            >
              <option value="">No quiz (standalone question)</option>
              {quizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100">
          {editingId ? 'Update Question' : 'Add Question'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={handleCancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {status === 'loading' && <p>Loading...</p>}
      {list.map((q) => {
        const inQuizzes = quizzesOf(q);
        // Chỉ cho chọn những quiz CHƯA chứa câu hỏi này
        const availableQuizzes = quizzes.filter((quiz) => !inQuizzes.some((x) => x._id === quiz._id));
        const chosen = availableQuizzes.some((quiz) => quiz._id === attachChoice[q._id])
          ? attachChoice[q._id]
          : availableQuizzes[0]?._id;
        return (
          <div key={q._id} className="border rounded p-3 mb-3">
            <h5>{q.text}</h5>
            <div className="mb-2">
              {inQuizzes.length > 0 ? (
                inQuizzes.map((quiz) => (
                  <span key={quiz._id} className="badge text-bg-primary me-1">
                    {quiz.title}
                  </span>
                ))
              ) : (
                <span className="badge text-bg-warning">Not in any quiz</span>
              )}
            </div>
            <ul>
              {q.options.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
            {availableQuizzes.length > 0 && (
              <div className="input-group input-group-sm mb-2" style={{ maxWidth: 360 }}>
                <select
                  className="form-select"
                  aria-label={`Quiz to add "${q.text}" to`}
                  value={chosen}
                  onChange={(e) => setAttachChoice((prev) => ({ ...prev, [q._id]: e.target.value }))}
                >
                  {availableQuizzes.map((quiz) => (
                    <option key={quiz._id} value={quiz._id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={attachingId === q._id}
                  onClick={() => handleAttach(q._id, chosen)}
                >
                  Add to quiz
                </button>
              </div>
            )}
            {attachError?.id === q._id && (
              <div className="text-danger small mb-2">{attachError.message}</div>
            )}
            <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(q)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ManageQuestions;