import { useState, useEffect, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa';

const MyForm = ({ getUsers, onEdit, setOnEdit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isTelefone, setIsTelefone] = useState([{ value: "" }]);
  const [typeFornecedor, setTypeFornecedor] = useState("");
  const [message, setMessage] = useState("");
  const ref = useRef();

  useEffect(() => {
    if (onEdit) {
      const user = ref.current;

      user.nome.value = onEdit.nome;
      user.email.value = onEdit.email;
      user.fone.value = onEdit.fone;
      user.data_nascimento.value = onEdit.data_nascimento;
    }
  }, [onEdit]);

  const handleAddTelefone = () => {
    setIsTelefone([...isTelefone, { value: "" }]);
  };

  const handleDeleteTelefone = (index) => {
    const newTelefone = [...isTelefone];
    newTelefone.splice(index, 1);
    setIsTelefone(newTelefone);
  };

  const handleTelefoneChange = (index, newValue) => {
    const newTelefone = [...isTelefone];
    newTelefone[index].value = newValue;
    setIsTelefone(newTelefone);
  };

  const formatTelefoneNumber = (telefoneNumber) => {
    if (!telefoneNumber) return ""; 
    telefoneNumber = telefoneNumber.replace(/\D/g, "");
    const regex = /^(\d{2})(\d{5})(\d{4})$/;
    return telefoneNumber.replace(regex, "($1) $2-$3");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = ref.current;

    if (
      !user.nome.value ||
      !user.email.value ||
      !isTelefone.every(telefone => telefone.value) ||
      !typeFornecedor
    ) {
      return toast.warn("Preencha todos os campos!");
    }

    const telefoneString = isTelefone.map(tel => tel.value).join(',');

    const userData = {
      nome: user.nome.value,
      email: user.email.value,
      fone: telefoneString,
      data_nascimento: user.data_nascimento.value,
      typeFornecedor: typeFornecedor,
      message: message
    };

    try {
      if (onEdit) {
        await axios.put(`http://localhost:8800/${onEdit.id}`, userData);
      } else {
        await axios.post("http://localhost:8800", userData);
      }
      toast.success(onEdit ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!");
      getUsers();
      setName('');
      setEmail('');
      setIsTelefone([{ value: "" }]);
      setTypeFornecedor('');
      setMessage('');
      setOnEdit(null);
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o usuário.");
    }
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Nome completo</Form.Label>
        <Form.Control name="nome" type="text" placeholder="Digite seu nome completo" defaultValue={onEdit?.nome} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>E-mail</Form.Label>
        <Form.Control name="email" type="email" placeholder="Digite seu email" defaultValue={onEdit?.email} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Telefones</Form.Label>
        {isTelefone.map((telefone, index) => (
          <div key={index} className="d-flex align-items-center mb-2">
            <Form.Control
              type="text"
              placeholder="Digite seu telefone"
              value={telefone.value}
              onChange={(e) => handleTelefoneChange(index, e.target.value)}
            />
            {index !== 0 && (
              <Button variant="danger" onClick={() => handleDeleteTelefone(index)} className="ms-2">
                <RiDeleteBin6Line />
              </Button>
            )}
          </div>
        ))}
        <Button variant="primary" onClick={handleAddTelefone}>
          <FaPlus /> Adicionar Telefone
        </Button>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Tipo de fornecedor</Form.Label>
        <Form.Select name="typeFornecedor" value={typeFornecedor} onChange={(e) => setTypeFornecedor(e.target.value)}>
          <option value="">Selecione o tipo</option>
          <option>Fabricante</option>
          <option>Atacadista</option>
          <option>Distribuidor</option>
          <option>Varejista</option>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Observação</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Digite sua observação aqui"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        {onEdit ? "Atualizar" : "Enviar"}
      </Button>
    </Form>
  );
};

export default MyForm;
