import React, { useState, useEffect } from "react";
import "./Pagination.css"; 

const Pagination = () => {
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMemberId, setEditMemberId] = useState(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
        );
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const selectPageHandler = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= Math.ceil(filterMembers().length / 10) &&
      selectedPage !== page
    ) {
      setPage(selectedPage);
    }
  };

  const handleSearchChange = (event) => {
    setPage(1); 
    setSearchTerm(event.target.value);
  };

  const handleEdit = (id, name) => {
    setEditMemberId(id);
    setEditMemberName(name);
  };

  const saveEdit = () => {
       setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === editMemberId
          ? { ...member, name: editMemberName }
          : member
      )
    );

    setEditMemberId(null);
    setEditMemberName("");
  };

  const cancelEdit = () => {
   setEditMemberId(null);
    setEditMemberName("");
  };

  const handleDelete = () => {
    setMembers((prevMembers) =>
      prevMembers.filter((member) => !selectedRows.includes(member.id))
    );
    setSelectedRows([]);
  };

  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const filterMembers = () => {
    return members.filter(
      (member) =>
        member.id.includes(searchTerm) ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderTableData = () => {
    const filteredMembers = filterMembers();
    const startIndex = (page - 1) * 10;
    const endIndex = page * 10;
    return filteredMembers.slice(startIndex, endIndex).map((member) => (
      <tr
        key={member.id}
        className={selectedRows.includes(member.id) ? "selected-row" : ""}
      >
        <td>
          <input
            type="checkbox"
            checked={selectedRows.includes(member.id)}
            onChange={() => handleCheckboxChange(member.id)}
          />
        </td>
        <td>{member.id}</td>
        <td>
          {editMemberId === member.id ? (
            <input
              type="text"
              value={editMemberName}
              onChange={(e) => setEditMemberName(e.target.value)}
            />
          ) : (
            member.name
          )}
        </td>
        <td>{member.email}</td>
        <td>{member.role}</td>
        <td>
          {editMemberId === member.id ? (
            <>
              <button onClick={saveEdit}>Save</button>
              <button onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              <span
                onClick={() => handleEdit(member.id, member.name)}
                className="action-icon"
                title="Edit"
              >
                🖊️
              </span>
              <span
                onClick={() => handleDelete(member.id)}
                className="action-icon"
                title="Delete"
              >
                🗑️
              </span>
            </>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="search-icon">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

       
       <div className="delete-selected">
        <span onClick={handleDelete} title="Delete Selected" className="bin-icon">
          🗑️
        </span>
        </div>

      <div className="table-container">
        <table className="member-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === filterMembers().length}
                  onChange={() => {
                    const currentPageRows = filterMembers().slice(
                      (page - 1) * 10,
                      page * 10
                    );
                    if (selectedRows.length === currentPageRows.length) {
                      
                      setSelectedRows([]);
                    } else {
                     
                      setSelectedRows((prev) => [
                        ...new Set([
                          ...prev,
                          ...currentPageRows.map((member) => member.id),
                        ]),
                      ]);
                    }
                  }}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{renderTableData()}</tbody>
        </table>
      </div>
    

      {members.length > 0 && (
        <div className="pagination">
          <span onClick={() => selectPageHandler(1)} title="First Page">
            ⏮️
          </span>
          <span
            onClick={() => selectPageHandler(page - 1)}
            className={page > 1 ? "" : "pagination__disable"}
            title="Previous Page"
          >
            ◀
          </span>

          {[...Array(Math.ceil(filterMembers().length / 10))].map((_, i) => (
            <span
              key={i}
              className={page === i + 1 ? "pagination__selected" : ""}
              onClick={() => selectPageHandler(i + 1)}
            >
              {i + 1}
            </span>
          ))}

          <span
            onClick={() => selectPageHandler(page + 1)}
            className={
              page < Math.ceil(filterMembers().length / 10)
                ? ""
                : "pagination__disable"
            }
            title="Next Page"
          >
            ▶
          </span>
          <span
            onClick={() =>
              selectPageHandler(Math.ceil(filterMembers().length / 10))
            }
            title="Last Page"
          >
            ⏭️
          </span>
        </div>
      )}
    </div>
  );
};

export default Pagination;
