import { useState, useEffect } from "react";
import { api } from '../../services/api';
import { Header } from "../../components/Header"
import { Button, Modal, Table, Form } from "react-bootstrap"
import { Container } from "react-bootstrap"; 
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaEdit, FaStar, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify'; // Importando o Toastify para exibir notificações

interface User {
  id: string
  name: string;
  email: string;
  number: string[];
  typeFornecedor: string;
  message: string;
}

export function Home(){
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelefone, setIsTelefone] = useState([{ value: "" }]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [onEdit, setOnEdit] = useState<User | null>(null);

  const [userIdToDelete, setUserIdToDelete] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [typeFornecedor, setTypeFornecedor] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };
    fetchUsers();
  }, []);

  const openModal = (user: User | null) => {
    setIsModalOpen(true);
    // Limpar os campos do formulário ao abrir o modal para um novo cadastro
    if (!user) {
      setName("");
      setEmail("");
      setIsTelefone([{ value: "" }]);
      setTypeFornecedor("");
      setMessage("");
    } else {
      // Se um usuário foi passado, definir o estado onEdit com esse usuário
      setOnEdit(user);
      setName(user.name);
      setEmail(user.email);
      // Certifique-se de que user.number é tratado como um array
      const telefoneArray = Array.isArray(user.number) ? user.number : [user.number];
      setIsTelefone(telefoneArray.map(num => ({ value: num })));
      setTypeFornecedor(user.typeFornecedor);
      setMessage(user.message);
    }
  };
  
  

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const handleAddTelefone = () => {
    setIsTelefone([...isTelefone, { value: "" }]);
  }

  const handleDeleteTelefone = (index: number) => {
    const newTelefone = [...isTelefone];
    newTelefone.splice(index, 1);
    setIsTelefone(newTelefone);
  }

  const handleTelefoneChange = (index: number, newValue: string) => {
    const newTelefone = [...isTelefone];
    newTelefone[index].value = newValue;
    setIsTelefone(newTelefone);
  }

  const formatTelefoneNumber = (telefoneNumber: string | string[]) => {
    const numbersArray = Array.isArray(telefoneNumber) ? telefoneNumber : [telefoneNumber];
    return numbersArray.map((phoneNumber: string) => {
      if (!phoneNumber) return "";
      phoneNumber = phoneNumber.replace(/\D/g, "");
      const regex = /^(\d{2})(\d{5})(\d{4})$/;
      return phoneNumber.replace(regex, "($1) $2-$3");
    }).join(", ");
  };

  const toggleRowSelection = (userId: string) => {
    const isSelected = selectedRows.includes(userId);
    let newSelectedRows: string[];
  
    if (isSelected) {
      newSelectedRows = selectedRows.filter(id => id !== userId);
    } else {
      newSelectedRows = [...selectedRows, userId];
    }
  
    setSelectedRows(newSelectedRows);
  };
  


  const createUser = () => {
    // Verifica se todos os campos obrigatórios foram preenchidos
    if (!name || !email || isTelefone.length === 0 || !typeFornecedor) {
      return alert("Preencha todos os campos obrigatórios!");
    }
  
    // Converte a lista de números de telefone em uma única string separada por vírgula
    const telefoneString = isTelefone.map(tel => tel.value).join(',');
  
    // Cria um novo objeto de usuário com os dados do formulário
    const newUser = {
      name: name,
      email: email,
      number: telefoneString,
      typeFornecedor: typeFornecedor,
      message: message
    };
  
    // Envia uma requisição POST para criar um novo usuário
    api.post("/", newUser)
      .then(response => {
        // Atualiza o estado local com a nova lista de usuários
        setUsers(prevUsers => [...prevUsers, response.data]);
        console.log("Novo usuário adicionado:", response.data);
  
        // Exibe um alerta indicando que o usuário foi criado com sucesso
        alert("Usuário criado com sucesso");
  
        // Limpa os campos do formulário após o cadastro bem-sucedido
        setName('');
        setEmail('');
        setIsTelefone([{ value: "" }]);
        setTypeFornecedor('');
        setMessage('');
  
        // Fecha o modal e limpa o estado de edição
        closeModal();
        setOnEdit(null);
      })
      .catch(error => {
        // Trata possíveis erros durante a requisição
        if (error.response) {
          alert(error.response.data.message);
        } else {
          alert("Não foi possível cadastrar");
        }
      });
  };

  const handleUpdate = async () => {
    if (!onEdit) {
      alert("Nenhum usuário selecionado para atualizar.");
      return;
    }
  
    try {
      const { id } = onEdit;
  
      // Obtém os números de telefone atualizados do estado
      const updatedNumbers = isTelefone.map(telefone => telefone.value);
  
      // Crie um objeto com os dados atualizados do usuário
      const updatedUser = {
        id,
        name,
        email,
        number: updatedNumbers,
        typeFornecedor,
        message
      };
  
      // Faça a requisição PUT para atualizar o usuário no backend
      await api.put(`/${id}`, updatedUser);
  
      // Atualize o estado local com os usuários atualizados
      const updatedUsers = users.map(user =>
        user.id === id ? { ...user, ...updatedUser } : user
      );
  
      setUsers(updatedUsers); // Atualize o estado local com os usuários atualizados
      toast.success("Usuário atualizado com sucesso"); // Exiba uma mensagem de sucesso
      closeModal(); // Feche o modal de edição
      setOnEdit(null); // Limpe o estado de edição
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error("Erro ao atualizar usuário"); // Exiba uma mensagem de erro, se ocorrer algum problema
    }
  };
  

const handleDelete = async (userId: any) => { // Alterado o tipo de userId para any
  try {
    const userIdString = String(userId); // Convertendo userId para string
    if (!userIdString || typeof userIdString !== 'string' || userIdString.trim() === '') {
      throw new Error('ID do usuário inválido');
    }

    // Defina o ID do usuário a ser excluído no estado
    setUserIdToDelete(userId);

    const confirmDelete = window.confirm("Tem certeza de que deseja excluir este usuário?");
    if (confirmDelete) {
      await api.delete(`/${userId}`);
      // Se a exclusão for bem-sucedida, atualize o estado local removendo o usuário excluído
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success("Usuário excluído com sucesso");
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    toast.error("Erro ao excluir usuário");
  } finally {
    // Limpe o estado do ID do usuário a ser excluído
    setUserIdToDelete("");
  }
};


  return(
    <>
      <Header />
      <Container>      
        <main className="d-flex flex-column gap-4">
          <section className="d-flex gap-3">
          <Button style={{ paddingInline: '30px'}} onClick={() => openModal(null)}>
            Novo cadastro
          </Button>
            <Button
              disabled={selectedRows.length !== 1}
              onClick={() => {
                const selectedUser = users.find(user => user.id === selectedRows[0]);
                if (selectedUser) {
                  openModal(selectedUser);
                }
              }}
            >
              <FaEdit />
            </Button>
            <Button 
              disabled={selectedRows.length === 0} 
              onClick={() => {
                const userIdToDelete = selectedRows.length > 0 ? selectedRows[0] : null; // Alterado para null
                if (userIdToDelete !== null) { // Verificando se userIdToDelete não é null
                  handleDelete(userIdToDelete);
                }
              }}
            >
              <RiDeleteBin6Line />
            </Button>
          </section>
          <section className="mb-4">
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefones</th>
                  <th>Tipo de Fornecedor</th>
                  <th>Observação</th>
                  <th>Favorito</th>
                </tr>
              </thead>
              <tbody>


              {users.map((user) => (
  <tr key={user.id}>
    <td className="align-middle text-center">
      <input 
        type="checkbox"
        style={{width:'20px', height:'20px'}}
        checked={selectedRows.includes(user.id)}
        onChange={() => toggleRowSelection(user.id)}
      />
    </td>
    <td>{user.name}</td>
    <td>{user.email}</td>
    <td>
      {Array.isArray(user.number) ? (
        user.number.map((phoneNumber, index) => (
          <div key={`${user.id}-${index}`}>
            {phoneNumber.split(",").map((num, i) => (
              <div key={`${user.id}-${index}-${i}`}>{formatTelefoneNumber(num)}</div>
            ))}
          </div>
        ))
      ) : (
        <div key={user.id}>
          {typeof user.number === 'string' && user.number.split(",").map((num: string | string[], i: any) => (
            <div key={`${user.id}-${i}`}>{formatTelefoneNumber(num)}</div>
          ))}
        </div>
      )}
    </td>
    <td>{user.typeFornecedor}</td>
    <td>{user.message}</td>
    <td className="align-middle text-center">
      <button>
        <FaStar />
      </button>
    </td>
  </tr>
))}
              </tbody>
            </Table>
          </section>
          <Modal show={isModalOpen} onHide={closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>Formulário</Modal.Title>
            </Modal.Header>
            <Modal.Body> 
              <Form.Group className="mb-3">
                <Form.Label>Nome completo</Form.Label>
                <Form.Control 
                  name="name" 
                  type="name" 
                  placeholder="Digite seu nome completo" 
                  value={name}
                  onChange={e => setName(e.target.value)} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control 
                  name="email" 
                  type="email" 
                  placeholder="Digite seu email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Telefones</Form.Label>
                {isTelefone.map((telefone, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <Form.Control 
                      name="number"
                      type="text"
                      value={formatTelefoneNumber(telefone.value)} 
                      placeholder="Digite seu telefone"
                      onChange={(e) => {
                        handleTelefoneChange(index, e.target.value);
                      }}
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
                <Form.Select name="typeFornecedor" value={typeFornecedor} onChange={e => setTypeFornecedor(e.target.value)}>
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
                  name="text" 
                  as="textarea" 
                  rows={4} 
                  value={message}
                  placeholder="Digite sua observação aqui" 
                  onChange={e => setMessage(e.target.value)}
                />
              </Form.Group>
              </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Fechar
              </Button>
              <Button
                type="submit"
                variant="success"
                onClick={() => (onEdit ? handleUpdate() : createUser())}
              >
                {onEdit ? 'Atualizar' : 'Enviar'}
              </Button>


            </Modal.Footer>
          </Modal>
        </main>
      </Container>
    </>
  )
}
