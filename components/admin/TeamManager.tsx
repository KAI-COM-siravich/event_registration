"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Pencil, Trash2, Shield, Loader2, Save, X } from "lucide-react";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  teamId: string | null;
  isHeadStaff: boolean;
  team?: { name: string };
};

type Team = {
  id: string;
  name: string;
  users: User[];
};

export function TeamManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<{ userId: string; isHead: boolean }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, usersRes] = await Promise.all([
        fetch("/api/admin/teams"),
        fetch("/api/admin/users/all"),
      ]);
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (usersRes.ok) setAllUsers(await usersRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (team?: Team) => {
    if (team) {
      setCurrentTeamId(team.id);
      setTeamName(team.name);
      setSelectedMembers(team.users.map(u => ({ userId: u.id, isHead: u.isHeadStaff })));
    } else {
      setCurrentTeamId(null);
      setTeamName("");
      setSelectedMembers([]);
    }
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setCurrentTeamId(null);
    setTeamName("");
    setSelectedMembers([]);
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => {
      if (prev.find(p => p.userId === userId)) {
        return prev.filter(p => p.userId !== userId);
      }
      return [...prev, { userId, isHead: false }];
    });
  };

  const toggleHead = (userId: string) => {
    setSelectedMembers(prev => 
      prev.map(p => p.userId === userId ? { ...p, isHead: !p.isHead } : p)
    );
  };

  const handleSave = async () => {
    if (!teamName.trim()) return alert("Team name is required");

    try {
      const url = currentTeamId ? `/api/admin/teams/${currentTeamId}` : "/api/admin/teams";
      const method = currentTeamId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName, members: selectedMembers }),
      });

      if (!res.ok) throw new Error("Failed to save team");

      await fetchData();
      handleCloseEdit();
    } catch (e) {
      console.error(e);
      alert("Error saving team");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      const res = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("Error deleting team");
    }
  };

  return (
    <div className="apple-card p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
            <Users className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Teams Management</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage staff teams and head staff visibility.</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => handleOpenEdit()}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Team
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isEditing ? (
        <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-medium text-foreground">{currentTeamId ? "Edit Team" : "Create Team"}</h4>
            <button onClick={handleCloseEdit} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Team Name</label>
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. Sales Division A"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Select Members & Assign Head Staff</label>
              <div className="rounded-lg border border-border/50 bg-background overflow-hidden max-h-64 overflow-y-auto">
                {allUsers.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No users available.</p>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {allUsers.map(user => {
                      const isSelected = selectedMembers.some(m => m.userId === user.id);
                      const isHead = selectedMembers.find(m => m.userId === user.id)?.isHead;
                      return (
                        <li key={user.id} className="flex items-center justify-between p-3 hover:bg-muted/30">
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                              checked={isSelected}
                              onChange={() => toggleMember(user.id)}
                            />
                            <div>
                              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                {user.team && (
                                  <span className="text-[10px] bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded-sm inline-block w-fit">
                                    Team: {user.team.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                          {isSelected && (
                            <button
                              onClick={() => toggleHead(user.id)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${isHead ? "bg-orange-500/10 text-orange-600 border border-orange-500/20" : "bg-muted text-muted-foreground border border-transparent hover:bg-muted/80"}`}
                              title={isHead ? "Remove Head Staff status" : "Make Head Staff"}
                            >
                              <Shield className="h-3.5 w-3.5" />
                              {isHead ? "Head Staff" : "Make Head"}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Team
              </button>
            </div>
          </div>
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No teams configured yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map(team => (
            <div key={team.id} className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-foreground text-sm">{team.name}</h4>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(team)} className="text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(team.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Members ({team.users.length})</p>
                {team.users.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No members</p>
                ) : (
                  <ul className="space-y-1.5">
                    {team.users.map(u => (
                      <li key={u.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{u.firstName} {u.lastName}</span>
                        {u.isHeadStaff && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded">
                            <Shield className="h-3 w-3" />
                            Head
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
